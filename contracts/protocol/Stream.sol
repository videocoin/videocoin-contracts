pragma solidity^0.5.17;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./ManagerInterface.sol";
import "./Escrow.sol";

/**
* @title Stream smart contract
* @dev Represents a video transcode job - is created by a client.
* The video is split in chunks; miners submit proofs for each chunk for each profile.
* Validators approve miner proofs.
* Because the solidity 0.5.13 compiler does not support ABI encoding for
* structs(except with the experimental flag which casts all the values to strings)
* we sometimes return the 'destructured' objects.
* The contract holds a list of input chunk ids (_inChunkIds) and of requested profiles (_profile).
* Each requested profile has an Outstream and each Outstream stores a dictionary of
* proof queues mapped for each input chunk. The proof queues store the proofs & ouput chunks
* submited by miners.
*/
contract Stream is Escrow {
  using SafeMath for uint256;

  struct Proof {
    address payable miner;
    uint256 outputChunkId;
    uint256 proof;
  }

  /**
  * @notice Simple queue-like data structure used for proof submission and validation.
  * @dev Head is used to determine FIFO order for miner proof submission & validation.
  * New proofs are pushed at the back of the array. Head increments when a proof discarded
  * and it points at oldest proof (first to be validated).
  * A proof is valid if ChunkProofQueue.validator != address(0).
  * The proof is found at ChunkProofQueue.proofs[ChunkProofQueue.head]
  */
  struct ChunkProofQueue {
    Proof[] proofs;
    uint256 head;
    address validator;
  }

  /**
  * @title OutStream
  * @dev The struct holds a map from chunkId to proof queues.
  * There is one OutStream per profile requested by client.
  */
  struct OutStream {
    bool required;
    uint256 index;
    uint256 validatedChunks;
    mapping (uint256 => ChunkProofQueue) proofQueues;
  }

  address public manager;
  uint256 public id;
  bool public ended;

  mapping (uint256 => bool) public isChunk;
  mapping (uint256 => uint256[]) public wattages;
  uint256[] private _inChunkIds;

  mapping (uint256 => OutStream) public outStreams;
  uint256[] private _profiles;

  /**
  * @notice Constructor.
  * @dev
  * @param _id The stream id.
  * @param client Address of the client that requested and created the stream.
  * @param profiles Array of profiles requested by client.
  */
  constructor(uint256 _id, address payable client, uint256[] memory profiles) Escrow(client) public {
    id = _id;
    manager = msg.sender;

    _profiles = profiles;
    for(uint i = 0; i < _profiles.length; i++) {
      OutStream memory outStream;
      outStream.required = true;
      outStream.index = i;

      outStreams[_profiles[i]] = outStream;
    }
  }

  /**
  * @notice Manager will add more input chunkIds as they become available.
  * @dev Method is called by manager contract.
  * Requires: chunckId not already registered.
  * Requires: stream not ended.
  * Modifiers: only callable by the manager contract.
  * @param chunkId ID of the chunk to be added.
  * @param wattage Array of wattage rewards for transcoding this chunk.
  */
  function addInputChunkId(uint256 chunkId, uint256[] memory wattage) public onlyManager {
    require(!isChunk[chunkId] && !ended);

    isChunk[chunkId] = true;
    wattages[chunkId] = wattage;
    _inChunkIds.push(chunkId);
  }

  /**
  * @notice Signals that the input stream has ended and no more input chunks are available.
  * @dev Called by manager contract.
  * Requires: stream not already ended.
  * Modifiers: only callable by the manager contract.
  */
  function endStream() public onlyManager {
    require(!ended);

    ended = true;
  }

  /**
  * @notice Miners use the method to submit proofs & output chunkIds.
  * Proofs of transcoding must be sumited for each input chunk for each each profile.
  * @dev Requires: that the profile was required by user when stream was created.
  * Requires: that the chunk was registered, i.e. by calling addInputChunk.
  * Requires: that the chunk is not already validated.
  * @param profile The hash of profile for which the proof is submited.
  * @param chunkId The chunk id for which the proof is submited.
  * @param proof Hash/proof.
  * @param outChunkId The ID by which we identify the output/transcoded chunk.
  */
  function submitProof(uint256 profile, uint256 chunkId, uint256 proof, uint256 outChunkId) public {
    ChunkProofQueue storage proofQueue = outStreams[profile].proofQueues[chunkId];
    require(isChunk[chunkId] && proofQueue.validator == address(0));
    require(outStreams[profile].required);

    proofQueue.proofs.push(Proof(msg.sender, outChunkId, proof));

    emit ChunkProofSubmited(chunkId, profile, proofQueue.proofs.length - 1);
  }

  /**
  * @notice Validators use the method to validate the first proof available in the queue.
  * @dev Requires: that proofs have been submited.
  * Requires: that the profile was required by user when stream was created.
  * Requires: that the chunk was registered, i.e. by calling addInputChunk.
  * Requires: that the chunk is not already validated.
  * Modifiers: only callable by validator accounts.
  * @param profile The hash of the profile for which we validate the proof.
  * @param chunkId The chunk id for which we validate the proof.
  */
  function validateProof(uint256 profile, uint256 chunkId) public onlyValidator {
    OutStream storage outStream = outStreams[profile];
    require(outStream.required);

    ChunkProofQueue storage proofQueue = outStream.proofQueues[chunkId];
    require(isChunk[chunkId] && proofQueue.validator == address(0));
    require(proofQueue.head < proofQueue.proofs.length);

    address payable miner = proofQueue.proofs[proofQueue.head].miner;

    uint256 amount = wattages[chunkId][outStream.index];
    // TODO: should fund the miner`s account at the staking manager for rewards distribution
    // TODO: also, when a proof is validated we should update transcoder`s reputation
    bool funded = fundAccount(miner, amount);
    if(!funded) return;

    proofQueue.validator = msg.sender;
    outStream.validatedChunks++;

    emit ChunkProofValidated(profile, chunkId);
  }

  /**
  * @notice Validators can scrap the first proof available in the queue if they consider so.
  * @dev This will increment the proofs queue head to point to the next proof.
  * This is where we would decrease miner reputation.
  * Requires: that the profile was required by user when stream was created.
  * Requires: that the chunk was registered, i.e. by calling addInputChunk.
  * Requires: that the chunk is not already validated.
  * Requires: that there we have proofs that can be scrapped.
  * Modifiers: only callable by validator accounts.
  * @param profile The hash of the profile for which we scrap the proof.
  * @param chunkId The chunk id for which we scrap the proof.
  */
  function scrapProof(uint256 profile, uint256 chunkId) public onlyValidator {
    ChunkProofQueue storage proofQueue = outStreams[profile].proofQueues[chunkId];
    require(isChunk[chunkId] && proofQueue.validator == address(0));
    require(proofQueue.head.add(1) <= proofQueue.proofs.length);

    uint256 idx = proofQueue.head;
    proofQueue.head = proofQueue.head.add(1);

    emit ChunkProofScrapped(profile, chunkId, idx);
  }

  /**
  * @notice Query whether the chunk has been validated
  * @dev Requires: that the profile was required by user when stream was created.
  * Requires: that the chunk was registered, i.e. by calling addInputChunk.
  * @param profile The hash of the profile for which we query proof validity.
  * @param chunkId The chunk id for which we query proof validity.
  * @return True if the chunk at the specified profile has a valid proof. Reverts if require conditions are not met.
  */
  function hasValidProof(uint256 profile, uint256 chunkId) public view returns (bool) {
    OutStream storage outStream = outStreams[profile];
    require(isChunk[chunkId] && outStream.required);

    return outStreams[profile].proofQueues[chunkId].validator != address(0);
  }

  /**
  * @notice Returns the proof of a validated chunk
  * @dev Requires that the proof has been validated
  * Requires: that all the requirements are ment for calling hasValidProof().
  * @param profile The hash of the profile for which we query the proof.
  * @param chunkId The chunk id for which we query the proof.
  * @return Object aggregating proof/hash, miner, validator and output chunk id.
  */
  function getValidProof(uint256 profile, uint256 chunkId) public view
                                        returns (address miner,
                                                address validator,
                                                uint256 outputChunkId,
                                                uint256 proof) {
    require(hasValidProof(profile, chunkId));

    ChunkProofQueue storage proofQueue = outStreams[profile].proofQueues[chunkId];

    uint256 idx = proofQueue.head;
    return (proofQueue.proofs[idx].miner, proofQueue.validator, proofQueue.proofs[idx].outputChunkId, proofQueue.proofs[idx].proof);
  }

  /**
  * @notice Returns the first proof canditate for validation/scraping.
  * @dev Validators should use this to query the current proof canditate before validating it.
  * Returns object with '0' values if no candidate proof, i.e. all submited proof have been scrapped.
  * Reverts if if no proof yet submited or idx out of bounds
  * Requires: that proofs have been submited.
  * Requires: getProof() requirements.
  * @param profile The hash of the profile for which we query the proof.
  * @param chunkId The chunk id for which we query the proof.
  * @return Object aggregating proof/hash, miner and output chunk id of the first proof that is a candidate for validation.
  */
  function getCandidateProof(uint256 profile, uint256 chunkId) public view
                                        returns (address miner,
                                                uint256 outputChunkId,
                                                uint256 proof) {
    ChunkProofQueue storage proofQueue = outStreams[profile].proofQueues[chunkId];
    uint256 count = proofQueue.proofs.length;
    require(count > 0);

    uint256 idx = proofQueue.head;

    if(idx < count ) {
      return getProof(profile, chunkId, idx);
    }

    return (address(0), 0, 0);
  }

  /**
  * @notice Query proof count for given chunk&profile.
  * @dev Requires: that the profile was required by user when stream was created.
  * Requires: that the chunk was registered, i.e. by calling addInputChunk.
  * @param profile The hash of the profile for which we query the proof count.
  * @param chunkId The chunk id for which we query the proof count.
  * @return Count of proof submited for that chunk at the specified profile.
  */
  function getProofCount(uint256 profile, uint256 chunkId) public view returns (uint256) {
    ChunkProofQueue storage proofQueue = outStreams[profile].proofQueues[chunkId];
    require(outStreams[profile].required && isChunk[chunkId]);

    return proofQueue.proofs.length;
  }

  /**
  * @notice Returns any proof that has been submited for the given chunk & profile from the
  * proof queue.
  * @dev Can be used to inspect the proof queue for a given chunk & profile.
  * Requires: that the profile was required by user when stream was created.
  * Requires: that the chunk was registered, i.e. by calling addInputChunk.
  * Requires: that the index is in range, i.e. lower than number of submited proofs.
  * @param profile The hash of the profile for which we query the proof.
  * @param chunkId The chunk id for which we query the proof.
  * @param idx The index for which we query the proof.
  * @return Object aggregating proof/hash, miner and output chunk id.
  */
  function getProof(uint256 profile, uint256 chunkId, uint256 idx) public view
                                        returns (address miner,
                                                uint256 outputChunkId,
                                                uint256 proof) {
    ChunkProofQueue storage proofQueue = outStreams[profile].proofQueues[chunkId];

    require(outStreams[profile].required && isChunk[chunkId]);
    require(idx < proofQueue.proofs.length);

    return (proofQueue.proofs[idx].miner, proofQueue.proofs[idx].outputChunkId, proofQueue.proofs[idx].proof );
  }

  /**
  * @notice Query whether transcoding is done for the given input chunks for all profiles.
  * @return True if the stream has valid proofs for every chunk for every profile.
  */
  function isTranscodingDone() public view returns (bool) {
    for(uint i = 0; i < _profiles.length; i++) {
      if(!isProfileTranscoded(_profiles[i]))
        return false;
    }
    return true;
  }

  /**
  * @notice Query whether transcoding is done for the given input chunks for given profile.
  * @dev Requires: that the profile was required by user when stream was created.
  * @param profile The hash of the profile for which we perform the query.
  * @return True if the profile has valid proofs for every chunk.
  */
  function isProfileTranscoded(uint256 profile) public view returns (bool) {
    OutStream storage outStream = outStreams[profile];
    require(outStream.required);

    return outStream.validatedChunks == _inChunkIds.length;
  }

  /**
  * @notice Query profile hashes; the hashes refer to the index array stored in the manager contract.
  * @return Array of the profiles indeces required by the client.
  */
  function getprofiles() public view returns (uint256[] memory) {
    return _profiles;
  }

  /**
  * @notice Query profile count.
  * @return The count of profiles requested on stream creation.
  */
  function getProfileCount() public view returns (uint256) {
    return _profiles.length;
  }

  /**
  * @notice Query input chunk ids.
  * @return Array of the input chunk ids.
  */
  function getInChunks() public view returns (uint256[] memory) {
    return _inChunkIds;
  }

  /**
  * @notice Query input chunk count.
  * @return Input chunk count.
  */
  function getInChunkCount() public view returns (uint256) {
    return _inChunkIds.length;
  }

  /**
  * @notice Query output chunk ids.
  * @dev Require: isBitrateTranscoded() requirements.
  * @param profile The hash of the profile for which we query the output chunks.
  * @return Array of the output chunk ids.
  */
  function getOutChunks(uint256 profile) public view returns (uint256[] memory) {
    require(isProfileTranscoded(profile));
    OutStream storage outStream = outStreams[profile];

    uint256[] memory outputChunks = new uint256[](_inChunkIds.length);

    for(uint i = 0; i < _inChunkIds.length; i++) {
      uint256 chunkId = _inChunkIds[i];
      ChunkProofQueue storage proofQueue = outStream.proofQueues[chunkId];
      uint256 head = proofQueue.head;
      uint256 outChunkid = proofQueue.proofs[head].outputChunkId;

      outputChunks[i] = outChunkid;
    }

    return outputChunks;
  }

  /**
  * @notice Query contract version.
  * @return Version string.
   */
  function getVersion() public view returns (string memory) {
    return ManagerInterface(manager).getVersion();
  }

  /**
  * @notice Query if refund is allowed.
  * @dev Inherited from Escrow, overriden.
  * @return True if the manager allows the refund (special case) or if the stream
  * has ended and all the chunks have been transcoded; false otherwise.
  */
  function refundAllowed() public view returns (bool) {
    bool managerPermission = ManagerInterface(manager).refundAllowed(id);
    bool streamDone = isTranscodingDone() && ended;

    return managerPermission || streamDone;
  }

  /**
  * @notice Modifier for methods only callable by validators
  * @dev The stream manager holds & manages the validator list.
  */
  modifier onlyValidator() {
    require(ManagerInterface(manager).isValidator(msg.sender));
    _;
  }

  /// @notice Modifier for methods only callable by the manager contract
  modifier onlyManager() {
    require(msg.sender == manager);
    _;
  }

  /// @dev Events
  event ChunkProofSubmited(uint256 indexed chunkId, uint256 indexed profile, uint256 indexed idx);
  event ChunkProofValidated(uint256 indexed profile, uint256 indexed chunkId);
  event ChunkProofScrapped(uint256 indexed profile, uint256 indexed chunkId, uint256 indexed idx);
}