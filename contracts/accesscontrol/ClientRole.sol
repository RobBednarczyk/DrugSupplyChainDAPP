pragma solidity >=0.4.24;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'ClientRole' to manage this role - add, remove, check
contract ClientRole {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event ClientAdded(address indexed account);
  event ClientRemoved(address indexed account);

  // Define a struct 'clients' by inheriting from 'Roles' library, struct Role
  Roles.Role private clients;

  // In the constructor make the address that deploys this contract the 1st Client
  /*constructor() public {
      _addClient(msg.sender);
  }*/

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlyClients() {
      require(isClient(msg.sender));
      _;
  }

  // Define a function 'isClient' to check this role
  function isClient(address account) public view returns (bool) {
      return clients.has(account);
  }

  // Define a function 'addClient' that adds this role
  function addClient(address account) public {
      _addClient(account);
  }

  // Define a function 'removeClient' to renounce this role
  function removeClient() public {
      _removeClient(msg.sender);
  }

  // Define an internal function '_addClient' to add this role, called by 'addClient'
  function _addClient(address account) internal {
      // "using Roles for Roles.Role" statement enables the following syntactic sugar
      clients.add(account);
      emit ClientAdded(account);
  }

  // Define an internal function '_removeClient' to remove this role, called by 'removeClient'
  function _removeClient(address account) internal {
      clients.remove(account);
      emit ClientRemoved(account);
  }
}
