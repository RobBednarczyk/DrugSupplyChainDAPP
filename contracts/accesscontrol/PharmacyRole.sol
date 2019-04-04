pragma solidity >=0.4.24;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'PharmacyRole' to manage this role - add, remove, check
contract PharmacyRole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event PharmacyAdded(address indexed account);
  event PharmacyRemoved(address indexed account);

  // Define a struct 'pharmacies' by inheriting from 'Roles' library, struct Role
  Roles.Role private pharmacies;

  // In the constructor make the address that deploys this contract the 1st Pharmacy
  /*constructor() public {
      _addPharmacy(msg.sender);
  }*/

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlyPharmacies() {
      require(isPharmacy(msg.sender));
      _;
  }

  // Define a function 'isPharmacy' to check this role
  function isPharmacy(address account) public view returns (bool) {
      return pharmacies.has(account);
  }

  // Define a function 'addPharmacy' that adds this role
  function addPharmacy(address account) public {
      _addPharmacy(account);
  }

  // Define a function 'removePharmacy' to renounce this role
  function removePharmacy() public {
      _removePharmacy(msg.sender);
  }

  // Define an internal function '_addPharmacy' to add this role, called by 'addPharmacy'
  function _addPharmacy(address account) internal {
      // "using Roles for Roles.Role" statement enables the following syntactic sugar
      pharmacies.add(account);
      emit PharmacyAdded(account);
  }

  // Define an internal function '_removePharmacy' to remove this role, called by 'removePharmacy'
  function _removePharmacy(address account) internal {
      pharmacies.remove(account);
      emit PharmacyRemoved(account);
  }
}
