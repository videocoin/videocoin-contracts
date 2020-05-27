pragma solidity ^0.5.13;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Registry is Ownable {

  struct ContractInfo {
    bool    initialized;
    string  name;
    string  version;
    address account;
  }

  mapping (bytes32 => ContractInfo) _records;
  mapping (string => string[]) _versions; 

  event RecordAdded(string indexed name, string indexed version);
  event RecordUpdated(string indexed name, string indexed versions);

  function update(string memory name, string memory version, address account) public onlyOwner {
    require(bytes(name).length != 0, "Registry: name is required");
    require(bytes(version).length != 0, "Registry: version is required");
    require(account != address(0), "Registry: account can't be zero");

    bytes32 key = sha256(abi.encode(name, version));

    if (!_records[key].initialized) {
      _versions[name].push(version);

      _records[key] = ContractInfo(true, name, version, account);

      emit RecordAdded(name, version);
    } else {
      _records[key] = ContractInfo(true, name, version, account);

      emit RecordUpdated(name, version);
    }
  }

  function record(string memory name, string memory version) public view returns(ContractInfo memory) {
    require(bytes(name).length != 0, "Registry: name is required");
    require(bytes(version).length != 0, "Registry: version is required");

    bytes32 key = sha256(abi.encode(name, version));
    return _records[key];
  }

  function versions(string memory name) public view returns(string[] memory) {
    require(bytes(name).length != 0, "Registry: name is required");

    return _versions[name];
  }
}