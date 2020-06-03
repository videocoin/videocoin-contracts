pragma solidity ^0.5.13;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./IStakingManager.sol";

contract CASStaking is Ownable {

  enum ChangeType { DEPOSIT, WITHDRAW }

  struct Change {
    address    delegator;
    address    transcoder;
    uint256    amount;
    ChangeType ctype;
  }

  uint256 public processed;
  IStakingManager public staking;

  constructor(IStakingManager _staking) public {
    staking = _staking;
  }

  function() external payable {}

  function cas(uint256 from, uint256 to, Change[] memory changes) public payable onlyOwner {
    require(processed == from, "CAS failure");
    processed = to;
    for (uint i = 0; i < changes.length; i++) {
      Change memory change = changes[i];
      if (change.ctype == ChangeType.DEPOSIT) {
        staking.delegateManaged.value(change.amount)(change.transcoder, change.delegator);
      } else if (change.ctype == ChangeType.WITHDRAW) {
        staking.requestUnbondingManaged(change.transcoder, change.delegator, change.amount);
      }
    }
    // don't leave anything in cas helper
    msg.sender.transfer(address(this).balance);
  }
}
