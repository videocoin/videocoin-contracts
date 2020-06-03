pragma solidity ^0.5.13;

contract IStakingManager {
  function delegateManaged(address transcoder, address delegator) public payable;
  function requestUnbondingManaged(address transcoder, address delegator, uint256 amount) public returns(uint256);
}
