pragma solidity^0.5.17;

/**
* @title Stream manager smart contract interface.
* @notice Used to avoid infinite recursive includes.
*/
contract ManagerInterface {
  /**
  * @notice Can query whether a client can refund the coins from a stream contract.
  * @param streamId ID of stream which we query.
  * @return True if stream is refundable, false otherwise.
  */
    function refundAllowed(uint256 streamId) public view returns (bool);

  /**
  * @notice Query whether a certain address is a validator.
  * @param v Adress of validator to be queried.
  * @return True if address is validator, false otherwise.
  */
    function isValidator(address v) public view returns (bool);

  /**
  * @notice Query contract version.
  * @return Version string.
  */
    function getVersion() public view returns (string memory);
}