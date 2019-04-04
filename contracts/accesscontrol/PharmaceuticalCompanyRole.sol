pragma solidity >=0.4.24;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'PharmaRole' to manage this role - add, remove, check
contract PharmaceuticalCompanyRole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event PharmaAdded(address indexed account);
  event PharmaRemoved(address indexed account);

  // Define a struct 'pharmaCompanies' by inheriting from 'Roles' library, struct Role
  Roles.Role private pharmaCompanies;

  // In the constructor make the address that deploys this contract the 1st pharmaCompany
  constructor() public {
    _addPharmaCompany(msg.sender);
  }

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlyPharmaCompanies() {
    require(isPharmaCompany(msg.sender));
    _;
  }

  // Define a function 'isPharmaCompany' to check this role
  function isPharmaCompany(address account) public view returns (bool) {
    return pharmaCompanies.has(account);
  }

  // Define a function 'addPharmaCompany' that adds this role
  function addPharmaCompany(address account) public {
    _addPharmaCompany(account);
  }

  // Define a function 'removePharmaCompany' to renounce this role
  function removePharmaCompany() public {
    _removePharmaCompany(msg.sender);
  }

  // Define an internal function '_addPharmaCompany' to add this role, called by 'addPharmaCompany'
  function _addPharmaCompany(address account) internal {
      // "using Roles for Roles.Role" statement enables the following syntactic sugar
      pharmaCompanies.add(account);
      emit PharmaAdded(account);
  }

  // Define an internal function '_removePharmaCompany' to remove this role, called by 'removePharmaCompany'
  function _removePharmaCompany(address account) internal {
    pharmaCompanies.remove(account);
    emit PharmaRemoved(account);
  }
}
