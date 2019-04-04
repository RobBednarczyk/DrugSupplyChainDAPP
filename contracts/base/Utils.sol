pragma solidity >=0.4.24;

contract Utils {
    // functions to manually concatenate strings:
    // https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI_0.5.sol

    // store the hash value concatenated coordinates
    mapping(bytes32 => uint256) public hashedCoords;

    function strConcat(string memory _a, string memory _b, string memory _c, string memory _d, string memory _e) internal pure returns (string memory) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        uint i;
        for (i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
        for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
        return string(babcde);
    }

    function strConcat(string memory _a, string memory _b, string memory _c, string memory _d) internal pure returns (string memory) {
        return strConcat(_a, _b, _c, _d, "");
    }

    function strConcat(string memory _a, string memory _b, string memory _c) internal pure returns (string memory) {
        return strConcat(_a, _b, _c, "", "");
    }

    function strConcat(string memory _a, string memory _b) internal pure returns (string memory) {
        return strConcat(_a, _b, "", "", "");
    }

    function storeHashedCoords(string memory _name, string memory _activeIngredient, uint _upc) public {
        string memory concatCoords = strConcat(_name, _activeIngredient);
        hashedCoords[keccak256(bytes(concatCoords))] = _upc;
    }
    /*function storeHashedCoords(string memory _name, uint _upc) public {
        //string memory concatCoords = strConcat(_name, _activeIngredient);
        hashedCoords[keccak256(bytes(_name))] = _upc;
    }*/

    // check if the drug with the given coords already
    function checkIfDrugExists(string memory _name, string memory _activeIngredient) public view returns(bool) {
        string memory concatCoords = strConcat(_name, _activeIngredient);
        if (hashedCoords[keccak256(bytes(concatCoords))] > 0) {
            return true;
        } else {
            return false;
        }
    }

    /*function checkIfDrugExists(string memory _name) public view returns(bool) {
        if (hashedCoords[keccak256(bytes(_name))] > 0) {
            return true;
        } else {
            return false;
        }
    }*/

    // compare strings
    function compareStrings(string memory _a, string memory _b) public pure returns(bool) {
        return (keccak256(abi.encodePacked(_a)) == keccak256(abi.encodePacked(_b)));
    }

}
