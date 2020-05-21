pragma solidity ^0.5.13;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Registry is Ownable {

  struct Record {
    bool    initialized;
    string  name;
    string  version;
    address account;
    address owner;
    uint    index;
  }

  mapping (bytes32 => Record) public records;
  mapping (string => string[]) public versions; 

  event VersionAdded(string indexed name, string indexed version);
  event VersionUpdated(string indexed name, string indexed versions);

  function update(string memory name, string memory version, address account, address owner) public onlyOwner {
    require(bytes(name).length != 0, "Registry: name is required");
    require(bytes(version).length != 0, "Registry: version is required");
    require(account != address(0), "Registry: account can't be zero");

    bytes32 key = sha256(abi.encode(name, version));

    if (!records[key].initialized) {
      uint index = versions[name].push(version) - 1;
      records[key] = Record(true, name, version, account, owner, index);

      emit VersionAdded(name, version);
    } else {
      records[key] = Record(true, name, version, account, owner, records[key].index);

      emit VersionUpdated(name, version);
    }
  }

  function remove(string memory name, string memory version) public onlyOwner {
    require(bytes(name).length != 0, "Registry: name is required");
    require(bytes(version).length != 0, "Registry: version is required");

    bytes32 key = sha256(abi.encode(name, version));
    
    if (records[key].initialized) {
      uint index = records[key].index;

      delete records[key];
      delete versions[name][index];
    }
  }

  function record(string memory name, string memory version) public view returns(Record memory) {
    require(bytes(name).length != 0, "Registry: name is required");
    require(bytes(version).length != 0, "Registry: version is required");

    bytes32 key = sha256(abi.encode(name, version));
    return records[key];
  }
}