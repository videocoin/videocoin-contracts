pragma solidity >=0.4.21 <0.7.0;

/**
* @title Versionable smart contract
* @dev Used to keep track of versions for smart contracts.
* This contract can be considered as an additional security layer. 
* Base class Versionable which will only constrain one field version tag. 
* The tag will be generated during docker image creation. 
* Docker image is supplied by tag value from the git repo. 
* If there is no tag, the image will be supplied by a particular commit value.
* Contracts will have to inherit this class.
*/
contract Versionable {
  string public version;

  constructor() public {
    // IMPORTANT: do not change this value
    version = "unset";
  }
}