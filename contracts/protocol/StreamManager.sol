pragma solidity^0.5.13;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/access/Roles.sol";
import "./Stream.sol";
import "./Escrow.sol";
import "./ManagerInterface.sol";


/**
* @title Stream manager contract
* @dev Stream smart contract factory with extra functionality.
* The contract has the following responsabilities:
*  - manages the validator list
*  - manages Stream aproval & creation
*  - manages refund permissions
*/
contract StreamManager is ManagerInterface, Ownable {
  using Roles for Roles.Role;

  struct StreamRequest {
    bool approved;
    bool refund;
    bool ended;
    address client;
    address stream;
    uint256[] profiles;
    uint256 streamId;
  }

  string public version;
  Roles.Role private _validators;
  Roles.Role private _publishers;
  mapping (uint256 => StreamRequest) public requests;
  mapping (uint256 => string) public profiles;

  uint256 public serviceSharePercent;

  constructor() public {
    // default value
    serviceSharePercent = 20;
    version = "0.0.7";
    // owner is one of the publisher for backward compatibility.
    addPublisher(msg.sender);
  }

  /**
  * @notice Returns the contracts` version.
  * @dev Streams hvae the same version with the Manager contracts that created them\.
  * @return Version string.
  */
  function getVersion() public view returns (string memory) {
    return version;
  }

  /**
  * @notice Manager can add validators.
  * @dev Requires: that the address was not already added and that it`s non-zero address.
  * Modifiers: only callable by manager account.
  * @param v Address of validator to be added.
  */
  function addValidator(address v) public onlyOwner {
    _validators.add(v);

    emit ValidatorAdded(v);
  }

  /**
  * @notice Manager can remove validators.
  * @dev Requires: that the address was previously added and that it`s non-zero address.
  * Modifiers: only callable by manager account.
  * @param v Address of validator to be removed.
  */
  function removeValidator(address v) public onlyOwner {
    _validators.remove(v);

    emit ValidatorRemoved(v);
  }

  /**
  * @notice Query whether a certain address is a validator.
  * @dev Also used by the stream contract onlyValidator modifier.
  * @param v Address of validator to be queried.
  * @return True if address is validator, false otherwise.
  */
  function isValidator(address v) public view returns (bool) {
    return _validators.has(v);
  }

  /**
  * @notice Manager can add publishers.
  * @dev Requires: that the address was not already added and that it`s non-zero address.
  * Modifiers: only callable by manager account.
  * @param v Address of publisher to be added.
  */
  function addPublisher(address v) public onlyOwner {
    _publishers.add(v);
    emit PublisherAdded(v);
  }

  /**
  * @notice Manager can remove publishers.
  * @dev Requires: that the address was previously added and that it`s non-zero address.
  * Modifiers: only callable by manager account.
  * @param v Address of publisher to be removed.
  */
  function removePublisher(address v) public onlyOwner {
    _publishers.remove(v);
    emit PublisherRemoved(v);
  }

  /**
  * @notice Query whether a certain address is a publisher.
  * @dev Also used by the stream contract onlyValidator modifier.
  * @param v Address of publisher to be queried.
  * @return True if address is publisher, false otherwise.
  */
  function isPublisher(address v) public view returns (bool) {
    return _publishers.has(v);
  }


  /**
  * @notice Users can request new streams (contracts).
  * @dev Requires: that the client account has not made a request with the same stream id before.
  * Requires: that the array of profiles is non empty.
  * @param streamId Unique ID for the stream.
  * @param profileNames Array of profile name strings.
  * @return stream id.
  */
  function requestStream(uint256 streamId, string[] memory profileNames) public returns (uint256) {
    require(requests[streamId].client == address(0));
    require(profileNames.length != 0);

    uint256[] memory profileHashes = new uint256[](profileNames.length);

    for (uint i = 0; i < profileNames.length; i++) {
      uint256 profileHash = uint256(keccak256(abi.encodePacked(profileNames[i])));
      profiles[profileHash] = profileNames[i];
      profileHashes[i] = profileHash;
    }

    bool approved = false;
    bool refund = false;
    bool ended = false;

    requests[streamId] = StreamRequest(approved, refund, ended, msg.sender, address(0), profileHashes, streamId);
    emit StreamRequested(msg.sender, streamId);

    return streamId;
  }

  /**
  * @notice Publishers can review stream requests, add extra data and approve them.
  * @dev Requires: that the request has been registered before.
  * Modifiers: only callable by one of the publishers account.
  * @param streamId ID of stream
  */
  function approveStreamCreation(uint256 streamId) public onlyPublisher {
    StreamRequest storage request = requests[streamId];
    require(request.client != address(0));

    request.approved = true;

    emit StreamApproved(streamId);
  }

  /**
  * @notice After approval the client can create the stream. Also the client needs
  * to fund the escrow on creation.
  * @dev Requires: that the request is approved.
  * Requires: that the caller is the same account that registered the request.
  * Requires: that the stream has not already been crfeated.
  * @param streamId ID of stream which we want to create, i.e. deploy a stream smart contract.
  * @return Address of the newly created stream contract.
  */
  function createStream(uint256 streamId) public payable returns (address) {
    StreamRequest storage request = requests[streamId];
    require(request.approved);
    require(request.client == msg.sender);
    require(request.stream == address(0));

    Stream stream = new Stream(streamId, msg.sender, request.profiles);
    stream.deposit.value(msg.value)();

    request.stream = address(stream);

    emit StreamCreated(request.stream, streamId);

    return request.stream;
  }

  /**
  * @notice Registers a new input chunk id with the given stream.
  * @dev Called by one of the publishers. Method is called as input chunk ids are created.
  * Requires: that the a stream corresponding to this id was already created.
  * Requires: that the array of wattages/rewards is non-empty.
  * Requires: that the call to stream.addInputChunkId() fullfils it`s requirements.
  * Calls addInputChunkId on the stream.
  * Modifiers: only callable by one of the publishers account.
  * @param streamId ID of stream to which we want to add the input chunk id.
  * @param chunkId ID of new input chunk; must be unique for that stream.
  * @param wattages Array of wattage rewards for transcoding this chunk.
  */
  function addInputChunkId(uint256 streamId, uint256 chunkId, uint256[] memory wattages) public onlyPublisher {
    StreamRequest storage request = requests[streamId];
    require(request.stream != address(0));
    require(wattages.length == request.profiles.length);

    Stream stream = Stream(request.stream);
    stream.addInputChunkId(chunkId, wattages);

    emit InputChunkAdded(streamId, chunkId);
  }

  /**
  * @notice Signals that a stream has ended and no more input chunks are available
  * @dev Can be called by manager or client(owner)
  * Requires: that the stream was not already ended
  * Requires: that the caller is either manager account or the account that created the stream.
  * @param streamId ID of stream which we we want to end.
  */
  function endStream(uint256 streamId) public {
    StreamRequest storage request = requests[streamId];

    require(!request.ended);
    require(isOwner() || msg.sender == request.client);

    Stream stream = Stream(request.stream);
    stream.endStream();

    request.ended = true;

    emit StreamEnded(streamId, msg.sender);
  }

  /**
  * @notice Can query whether a client can refund the coins from a stream contract.
  * @dev Also called by stream/escrow contract.
  * @param streamId ID of stream which we query.
  * @return True if stream is refundable, false otherwise.
  */
  function refundAllowed(uint256 streamId) public view returns (bool) {
    return requests[streamId].refund;
  }

  /**
  * @notice Publisher can allow client refunds.
  * @dev Requires: that there is a request with this id.
  * Requires: that refund was not already allowed.
  * Modifiers: only callable by one of the publishers account.
  * @param streamId ID of stream for which the refund is allowed.
  */
  function allowRefund(uint256 streamId) public onlyPublisher {
    require(requests[streamId].client != address(0));
    require(requests[streamId].refund != true);

    requests[streamId].refund = true;

    emit RefundAllowed(streamId);
  }

  /**
  * @notice Publisher can revoke refund permission.
  * @dev Requires: that there is a request with this id.
  * Requires: that refund was allowed before.
  * Modifiers: only callable by one of the publishers account.
  * @param streamId ID of stream for which the refund is revoked.
  */
  function revokeRefund(uint256 streamId) public onlyPublisher {
    require(requests[streamId].client != address(0));
    require(requests[streamId].refund != false);

    requests[streamId].refund = false;

    emit RefundRevoked(streamId);
  }

  /**
  * @notice Owner can update service share percent.
  * @param percent service share percents.
  */
  function setServiceSharePercent(uint256 percent) public onlyOwner {
    require(0 <= percent && percent <= 100, "StreamManager: percent should be in [0; 100] range");

    serviceSharePercent = percent;

    emit ServiceSharePercentUpdated(serviceSharePercent);
  }

  /**
  * @notice Query service share percent.
  * @return Service share percent uint256.
  */
  function getServiceSharePercent() public view returns(uint256) {
    return serviceSharePercent;
  }

  /// modifiers

  /**
  * @notice Modifier for methods only callable by publishers.
  * @dev The stream manager holds & manages the publishers list.
  */
  modifier onlyPublisher() {
    require(isPublisher(msg.sender));
    _;
  }

  /// @dev events

  event StreamRequested(address indexed client, uint256 indexed streamId);
  event StreamApproved(uint256 indexed streamId);
  event StreamCreated(address indexed streamAddress, uint256 indexed streamId);

  event ValidatorAdded(address indexed validator);
  event ValidatorRemoved(address indexed validator);

  event PublisherAdded(address indexed publisher);
  event PublisherRemoved(address indexed publisher);

  event RefundAllowed(uint256 indexed streamId);
  event RefundRevoked(uint256 indexed streamId);

  event InputChunkAdded(uint256 indexed streamId, uint256 indexed chunkId);
  event StreamEnded(uint256 indexed streamId, address indexed caller);

  event ServiceSharePercentUpdated(uint256 indexed percent);
}
