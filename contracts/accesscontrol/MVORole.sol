pragma solidity >=0.4.24;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'MVORole' to manage this role - add, remove, check
contract MVORole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event MVOAdded(address indexed account);
  event MVORemoved(address indexed account);

  // Define a struct 'MVOs' by inheriting from 'Roles' library, struct Role
  Roles.Role private MVOs;

  // In the constructor make the address that deploys this contract the 1st MVO
  /*constructor() public {
    _addMVO(msg.sender);
  }*/

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlyMVOs() {
    require(isMVO(msg.sender));
    _;
  }

  // Define a function 'isMVO' to check this role
  function isMVO(address account) public view returns (bool) {
    return MVOs.has(account);
  }

  // Define a function 'addMVO' that adds this role
  function addMVO(address account) public {
    _addMVO(account);
  }

  // Define a function 'removeMVO' to renounce this role
  function removeMVO() public {
    _removeMVO(msg.sender);
  }

  // Define an internal function '_addMVO' to add this role, called by 'addMVO'
  function _addMVO(address account) internal {
      // "using Roles for Roles.Role" statement enables the following syntactic sugar
      MVOs.add(account);
      emit MVOAdded(account);
  }

  // Define an internal function '_removeMVO' to remove this role, called by 'removeMVO'
  function _removeMVO(address account) internal {
    MVOs.remove(account);
    emit MVORemoved(account);
  }
}
