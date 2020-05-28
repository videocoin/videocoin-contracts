pragma solidity ^0.5.13;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract StakingBridge is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  event Locked(address indexed delegator, address indexed transcoder, uint256 value);
  event UnlockRequested(address indexed delegator, address indexed transcoder, uint256 value);
  event Unlocked(address indexed delegator, address indexed transcoder, uint256 value);

  mapping (address => uint256) public locked;
  mapping (address => uint256) public requested;
  // TODO collect slashed amounts into the pool
  uint64 public slashedPool;
  IERC20 private _token;

  constructor(IERC20 token) public {
    _token = token;
  }

  // transcoder is a hint for the service on videocoin network
  function lock(uint256 value, address transcoder) external {
    _token.safeTransferFrom(msg.sender, address(this), value);
    locked[msg.sender] = locked[msg.sender].add(value);
    emit Locked(msg.sender, transcoder, value);
  }

  function request(uint256 value, address transcoder) external {
    require(locked[msg.sender] >= value, "requested to unlock more than available");
    requested[msg.sender] = requested[msg.sender].add(value);
    locked[msg.sender] = locked[msg.sender].sub(value);
    emit UnlockRequested(msg.sender, transcoder, value);
  }

  function unlock(uint256 value, address delegator, address transcoder) external onlyOwner {
    require(requested[delegator] >= value, "unlocked more than requested");
    requested[delegator] = requested[delegator].sub(value);
    _token.safeIncreaseAllowance(delegator, value);
    emit Unlocked(delegator, transcoder, value);
  }

  // TODO slash either from locked or requested amounts
  function slash(uint256 value, address delegator, address transcoder) external onlyOwner {
  }

  function collectSlashed(address account) external onlyOwner {
    require(slashedPool > 0, "slashed pool is empty");
    uint64 amount = slashedPool;
    slashedPool = 0;
    _token.safeTransfer(account, amount);
  }
}
