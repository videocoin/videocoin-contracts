pragma solidity ^0.5.17;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
* @title Payment manager contract
* @notice This contract is used by Payment manager service as a storage for payout transactions which were executed on local and foreign blockchains.
*/
contract PaymentManager is Ownable {

  enum State {EMPTY, PENDING, FAILED, SUCCESS}

  event PendingTransfer(address indexed signer, uint64 indexed nonce, bytes32 indexed txHash);
  event Retry(bytes32 indexed txHash);
  event TxSuccess(bytes32 indexed local, bytes32 indexed foreign);
  event TxFailed(bytes32 indexed local, bytes32 indexed foreign);

  struct txState {
    bytes32 hash;
    address signer;
    uint64 nonce;
    State state;
  }

  mapping(bytes32 => txState) public transfers;

  constructor() public {}

  /**
  * @notice Manager can add a new transaction records and emit PendingTransfer.
  * @param signer Address of signer to be added.
  * @param nonce Signer nonce.
  * @param local Hash of the transaction executed on local chain.
  * @param foreign Hash of the transaction executed on foreign chain.
  */
  function submitPending(address signer, uint64 nonce, bytes32 local, bytes32 foreign) external onlyOwner {
    require(signer != address(0), "invalid address");
    require(local != 0, "invalid local tx hash");
    require(foreign !=0, "invalid foreign tx hash");
    require(transfers[local].state == State.EMPTY || transfers[local].state == State.PENDING, "record is finalized");

    transfers[local] = txState(foreign, signer, nonce, State.PENDING);

    emit PendingTransfer(signer, nonce, local);
  }

  /**
  * @notice Manager can update transaction record with success status.
  * @param local Hash of the transaction executed on local chain.
  * @param foreign Hash of the transaction executed on foreign chain.
  */
  function submitSuccess(bytes32 local, bytes32 foreign) public onlyOwner {
    require(local != 0, "invalid local tx hash");
    require(foreign !=0, "invalid foreign tx hash");
    require(transfers[local].state != State.EMPTY, "record is uninitialized");

    // TODO: do we need to store successful transactions?
    transfers[local].state = State.SUCCESS;
    transfers[local].hash = foreign;

    emit TxSuccess(local, foreign);
  }

  /**
  * @notice Manager can update transaction record with failed status.
  * @param local Hash of the transaction executed on local chain.
  * @param foreign Hash of the transaction executed on foreign chain.
  */
  function submitFailed(bytes32 local, bytes32 foreign) public onlyOwner {
    require(local != 0, "invalid local tx hash");
    require(foreign != 0, "invalid foreign tx hash");
    require(transfers[local].state != State.EMPTY, "record is uninitialized");

    transfers[local].state = State.FAILED;
    transfers[local].hash = foreign;

    emit TxFailed(local, foreign);
  }

  /**
  * @notice Manager can remove transaction record and emit Retry event.
  * @param txHash Hash of the transaction executed on local chain.
  */
  function requestRetry(bytes32 txHash) public onlyOwner {
    require(txHash != 0, "invalid tx hash");
    require(transfers[txHash].state == State.FAILED, "only failed records");

    delete transfers[txHash];

    emit Retry(txHash);
  }
}
