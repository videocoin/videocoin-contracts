pragma solidity^0.5.13;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
* @title Simple escrow contract (abstract)
* @dev It is inherited by the Stream contract.
*/
contract Escrow {
  using SafeMath for uint256;

  address payable public client;

  /**
  * @notice Constructor
  * @param _client Client address.
  */
  constructor(address payable _client) public {
    require(_client != address(0));
    client = _client;
  }

  /// @notice Deposit an amount to escrow on behalf of the client account.
  /// @dev Anyone that calls the method funds the client account.
  function deposit() external payable {
    emit Deposited(msg.value);
  }

  /**
  * @notice Cand refund the remaining funds to the client that requested the stream
  * if allowed by manager.
  */
  function refund() public {
    require(refundAllowed());

    uint256 balance = address(this).balance;
    client.transfer(balance);

    emit Refunded(balance);
  }

  /**
  * @notice Query whether refund is allowed.
  * @dev To be implemented by derived contracts.
  * @return True if refund is allowed; false otherwise.
  */
  function refundAllowed() public view returns (bool);

  /**
  * @notice Transfers funds to the given address
  * @dev We are supressing actual transfer. Now function only emits events
  * @param account Account to be logged on the blockchain.
  * @param accountAmount Amount to be logged on the blockchain.
  * @param serviceAmount Amount to be logged on the blockchain.
  * @return True if account was funded; false otherwise.
  */
  function fundAccount(address payable account, uint256 accountAmount, uint256 serviceAmount) internal returns (bool) {
    uint256 balance = address(this).balance;
    uint256 amount = accountAmount + serviceAmount;

    if(balance == 0 || balance < amount) {
      emit OutOfFunds();
      return false;
    }

    // Supress actual transfer
    // account.transfer(amount);

    emit AccountFunded(account, accountAmount);
    emit ServiceFunded(serviceAmount);

    return true;
  }

  /// @dev events
  event Deposited(uint256 indexed weiAmount);
  event Refunded(uint256 weiAmount);
  event AccountFunded(address indexed account, uint256 weiAmount);
  event ServiceFunded(uint256 weiAmount); 
  event OutOfFunds();
}