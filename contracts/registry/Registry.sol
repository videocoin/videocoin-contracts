pragma solidity ^0.5.13;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Registry is Ownable {

  struct ContractInfo {
    bool    initialized;
    string  name;
    string  version;
    address account;
    address owner;
  }

  struct VersionInfo {
    uint     length;
    string[] list;
  }

  mapping (bytes32 => ContractInfo) public records;
  mapping (string => VersionInfo) public versions; 

  event RecordAdded(string indexed name, string indexed version);
  event RecordUpdated(string indexed name, string indexed versions);

  function update(string memory name, string memory version, address account, address owner) public onlyOwner {
    require(bytes(name).length != 0, "Registry: name is required");
    require(bytes(version).length != 0, "Registry: version is required");
    require(account != address(0), "Registry: account can't be zero");

    bytes32 key = sha256(abi.encode(name, version));

    if (!records[key].initialized) {
      versions[name].list.push(version);
      versions[name].length = versions[name].list.length;

      records[key] = ContractInfo(true, name, version, account, owner);

      emit RecordAdded(name, version);
    } else {
      records[key] = ContractInfo(true, name, version, account, owner);

      emit RecordUpdated(name, version);
    }
  }

  function record(string memory name, string memory version) public view returns(ContractInfo memory) {
    require(bytes(name).length != 0, "Registry: name is required");
    require(bytes(version).length != 0, "Registry: version is required");

    bytes32 key = sha256(abi.encode(name, version));
    return records[key];
  }

  function version(string memory name, uint index) public view returns(string memory) {
    require(bytes(name).length != 0, "Registry: name is required");
    require(index < versions[name].list.length, "Registry: out of range");

    return versions[name].list[index];
  }
}