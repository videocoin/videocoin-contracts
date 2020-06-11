pragma solidity ^0.5.13;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract StakingEscrow {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  event Locked(address indexed delegator, address indexed delegatee, uint256 value);
  event Unlocked(address indexed delegator, address indexed delegatee, uint256 value);

  mapping (address => mapping (address => uint256)) public locked;
  IERC20 private _token;

  constructor(IERC20 token) public {
    _token = token;
  }

  function transfer(address recipient, uint256 amount) external returns (bool) {
    require(amount > 0, "can't deposit zero");
    _token.safeTransferFrom(msg.sender, address(this), amount);
    locked[msg.sender][recipient] = locked[msg.sender][recipient].add(amount);
    emit Locked(msg.sender, recipient, amount);
    return true;
  }

  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
    require(amount > 0, "can't withdraw zero");
    require(recipient == msg.sender, "can be executed only by recipient");
    require(locked[recipient][sender] >= amount, "requested more than available");
    locked[recipient][sender] = locked[recipient][sender].sub(amount);
    _token.safeTransfer(recipient, amount);
    emit Unlocked(recipient, sender, amount);
    return true;
  }
}
