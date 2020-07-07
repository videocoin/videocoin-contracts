pragma solidity ^0.5.13;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract BatchTransfer {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  event BatchedTransfer(address indexed from, address indexed to, uint256 amount);

  struct Transfer {
    address to;
    uint256 amount;
  }

  constructor() public {}

  function transfer(IERC20 token, uint256 total, Transfer[] calldata transfers) external {
    token.safeTransferFrom(msg.sender, address(this), total);
    for (uint i = 0; i < transfers.length; i++) {
      Transfer memory tn = transfers[i];
      token.safeTransfer(tn.to, tn.amount);
      total = total.sub(tn.amount);
      emit BatchedTransfer(msg.sender, tn.to, tn.amount);
    }
    // transfer leftover back to the calling account
    if (total > 0) {
      token.safeTransfer(msg.sender, total);
    }
  }
}
