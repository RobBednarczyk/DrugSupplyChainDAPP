pragma solidity >=0.4.24;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'WholeSaleCompanyRole' to manage this role - add, remove, check
contract WholeSaleCompanyRole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event WholeSaleCompanyAdded(address indexed account);
  event WholeSaleCompanyRemoved(address indexed account);

  // Define a struct 'wholeSaleCompanies' by inheriting from 'Roles' library, struct Role
  Roles.Role private wholeSaleCompanies;

  // In the constructor make the address that deploys this contract the 1st wholeSaleCompany
  /*constructor() public {
      _addWholeSaleCompany(msg.sender);
  }*/

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlyWholeSaleCompanies() {
      require(isWholeSaleCompany(msg.sender));
      _;
  }

  // Define a function 'isWholeSaleCompany' to check this role
  function isWholeSaleCompany(address account) public view returns (bool) {
      return wholeSaleCompanies.has(account);
  }

  // Define a function 'addWholeSaleCompany' that adds this role
  function addWholeSaleCompany(address account) public {
      _addWholeSaleCompany(account);
  }

  // Define a function 'removeMVO' to renounce this role
  function removeWholeSaleCompany() public {
      _removeWholeSaleCompany(msg.sender);
  }

  // Define an internal function '_addWholeSaleCompany' to add this role, called by 'addWholeSaleCompany'
  function _addWholeSaleCompany(address account) internal {
      // "using Roles for Roles.Role" statement enables the following syntactic sugar
      wholeSaleCompanies.add(account);
      emit WholeSaleCompanyAdded(account);
  }

  // Define an internal function '_removeWholeSaleCompany' to remove this role, called by 'removeWholeSaleCompany'
  function _removeWholeSaleCompany(address account) internal {
      wholeSaleCompanies.remove(account);
      emit WholeSaleCompanyRemoved(account);
  }
}
