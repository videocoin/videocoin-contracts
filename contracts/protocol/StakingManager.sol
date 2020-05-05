pragma solidity^0.5.17;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
* @title DPoS staking manager for transcoders and delegators.
* @notice  To become a transcoder you need to stake a minimal amount required.
* Transcoder is bonded if approval period passes and self stake is higher than minimum stake.
* Transcoders and delegators can withdraw stake after a set amount of time.
*/
contract StakingManager is Ownable {
  using SafeMath for uint256;

  enum TranscoderState { BONDING, BONDED, UNBONDED, UNBONDING }

  /// @dev Represents a transcoder's current state
  struct Transcoder {
    uint256 total;                      // total bonded amount in a pool
    uint256 timestamp;                  // transcoder's registration timestamp
    uint256 rewardRate;                 // Percentage of rewards that the transcoder will share with delegators
    uint256 rewards;                    // rewards total
    uint256 zone;                       // id for transcoder zone
    uint256 capacity;                   // transcoder capacity; uwatt
    Slash[] slashes;                    // list of slashes values
    address[] delegators;               // array of all delegators that staked to a transcoders
    bool jailed;                        // flag for jailing transcoder for misbehaving
  }

  /// @dev Represents a delegator's current state
  struct Delegator {
    mapping (address=>uint256) bondedAmounts;               // bonded amounts indexed to transcoders
    mapping (address=>uint256) slashCounters;               // slash counters indexed to transcoders
    mapping (uint256=>UnbondingRequest) unbondingRequests;  // mapping of unbonding requests timestamps
    uint256 pending;                                         // index of the first pending unbonding request
    uint256 next;                                           // index for next unboding request
  }

  struct UnbondingRequest {
    address transcoder;     // transcoder from which we unbond
    uint256 timestamp;      // request timestamp
    uint256 amount;         // amount requested
  }

  struct Slash {
    uint256 timestamp;
    uint256 rate;
  }

  uint256 public minDelegation;                       // minimum stake amount for delegator
  uint256 public minSelfStake;                        // minimum stake for transcoder to be become BONDED
  uint256 public transcoderApprovalPeriod;            // transcoder approval period
  uint256 public unbondingPeriod;                     // unbonding period for stake withdrawal
  uint256 public slashRate;                           // rate by which stakes are slashed; percents
  address payable slashPoolAddress;                   // address to which slashed funds go to
  mapping (address=>Transcoder) public transcoders;   // mapping of all transcoders
  mapping (address=>Delegator) public delegators;     // mapping of all delegators
  address[] public transcodersArray;

  /// @dev events
  event TranscoderRegistered(address indexed transcoder);
  event Delegated(address indexed transcoder, address indexed delegator, uint256 indexed amount);

  event Slashed(address indexed transcoder, uint256 indexed rate);
  event Jailed(address indexed transcoder);
  event Unjailed(address indexed transcoder);

  event UnbondingRequested(uint256 indexed unbondingID, address indexed delegator, address indexed transcoder,
                           uint256 readiness, uint256 amount);
  event StakeWithdrawal(uint256 indexed unbondingID, address indexed delegator, address indexed transcoder, uint256 amount);

  /**
  * @notice Constructor.
  * @param _minDelegation min delegation
  * @param _minSelfStake  min self stake
  * @param _transcoderApprovalPeriod transcoder approval period
  * @param _unbondingPeriod unbonding period
  * @param _slashRate rate by which stakes are slashed
  */
  constructor(uint256 _minDelegation,
                uint256 _minSelfStake,
                uint256 _transcoderApprovalPeriod,
                uint256 _unbondingPeriod,
                uint256 _slashRate,
                address payable _slashPoolAddress) public {

    minDelegation = _minDelegation;
    minSelfStake = _minSelfStake;
    transcoderApprovalPeriod = _transcoderApprovalPeriod;
    unbondingPeriod = _unbondingPeriod;
    slashRate = _slashRate;
    slashPoolAddress = _slashPoolAddress;
  }

  /**
  * @notice Setter for minimum self-stake, i.e. bonding treshold.
  * @dev
  * @param amount minimum self stake amount
  */
  function setSelfMinStake(uint256 amount) public onlyOwner() {
    require(amount > 0);

    minSelfStake = amount;
  }

  /**
  * @notice Setter for approval period
  * @dev
  * @param period aproval period in seconds
  */
  function setApprovalPeriod(uint256 period) public onlyOwner() {
    transcoderApprovalPeriod = period;
  }

  /**
  * @notice Setter for trancoder zone.
  * @dev
  * @param addr transcoder address
  * @param zone zone id
  */
  function setZone(address addr, uint256 zone) public onlyOwner() {
    Transcoder storage transcoder = transcoders[addr];
    require(transcoder.timestamp > 0, "Transcoder not registered");

    transcoder.zone = zone;
  }

  /**
  * @notice Setter for slash pool address.
  * @dev Can be 0x0
  * @param addr new slash pool address
  */
  function setSlashFundAddress(address payable addr) public onlyOwner() {
    require(slashPoolAddress != addr, "Already set to this address");
    slashPoolAddress = addr;
  }

  /**
  * @notice Setter for trancoder capacity.
  * @dev
  * @param addr transcoder address
  * @param capacity transcoder capacity in uwatt
  */
  function setCapacity(address addr, uint256 capacity) public onlyOwner() {
    Transcoder storage transcoder = transcoders[addr];
    require(transcoder.timestamp > 0, "Transcoder not registered");

    transcoder.capacity = capacity;
  }

  /**
  * @notice Method to register as transcoder.
  * @dev rate parameter not used for now
  * @param rate Percentage of rewards that the transcoder will share with delegators
  */
  function registerTranscoder(uint256 rate) external {
    require(rate < 100, "Rate must be a percentage between 0 and 100");
    address addr = msg.sender;

    Transcoder storage transcoder = transcoders[addr];
    require(transcoder.timestamp == 0, "Transcoder already registered");

    transcoder.timestamp = now;
    transcoder.rewardRate = rate;
    transcodersArray.push(addr);
    emit TranscoderRegistered(addr);
  }

  /**
  * @notice Delegate tokens to a transcoder. Transcoders will call this to self-delegate.
  * @dev Needs to send minimal delegation amount.
  * @param transcoderAddr Transcoder address.
  */
  function delegate(address transcoderAddr) public payable {
    address delegatorAddr = msg.sender;
    uint256 value         = msg.value;

    Transcoder storage transcoder = transcoders[transcoderAddr];
    Delegator storage delegator   = delegators[delegatorAddr];

    require(transcoderAddr != address(0), "Can`t use address 0x0");
    require(value >= minDelegation, "Must deposit at least minimum value");
    require(transcoder.timestamp > 0, "Transcoder not registered");

    if(delegator.bondedAmounts[transcoderAddr] == 0) { // new delegator for this transcoder
      transcoder.delegators.push(delegatorAddr);
      delegator.slashCounters[transcoderAddr] = transcoder.slashes.length;
    }

    applySlash(transcoderAddr, delegatorAddr);

    transcoder.total = transcoder.total.add(value);
    delegator.bondedAmounts[transcoderAddr] = delegator.bondedAmounts[transcoderAddr].add(value);

    emit Delegated(transcoderAddr, delegatorAddr, value);
  }

  /**
  * @notice Delegator requests stake unbonding. Delegator has to wait for unbondingPeriod before calling withdrawStake() with the returned ID.
  * @dev Requests get approved immediately if tcoder`s state is BONDING or UNBONDED
  * @param transcoderAddr transcoder address from which to unbond
  * @param amount amount to unbond
  */
  function requestUnbonding(address transcoderAddr, uint256 amount) public returns(uint256) {
    require(transcoderAddr != address(0), "Can`t use address 0x0");

    address delegatorAddr = msg.sender;

    Transcoder storage transcoder = transcoders[transcoderAddr];
    Delegator storage delegator   = delegators[delegatorAddr];

    applySlash(transcoderAddr, delegatorAddr); // slash so we can update amounts to check what if we can unbond
    require(amount <= delegator.bondedAmounts[transcoderAddr], "Not enough funds");

    // if transcoder withdraws from himself, and the total ammount is less than minSelfStake transcoder will enter
    // BONDING state. And this will allow to withdraw everything immediatly.
    // after this change it is still possible for transcoder to withdraw just enough to enter BONDING state
    // and then withdraw everything else immediatly.
    TranscoderState state = getTranscoderState(transcoderAddr);

    delegator.bondedAmounts[transcoderAddr] = delegator.bondedAmounts[transcoderAddr].sub(amount);
    transcoder.total = transcoder.total.sub(amount);

    uint256 unbondingID = delegator.next;
    delegator.next = delegator.next.add(1);

    if(state == TranscoderState.BONDING || state == TranscoderState.UNBONDED) {
      emit UnbondingRequested(unbondingID, delegatorAddr, transcoderAddr, now, amount);
      delegator.unbondingRequests[unbondingID] = UnbondingRequest(transcoderAddr, now - unbondingPeriod, amount); // we can withdraw immediatelly
      require(withdrawStake(unbondingID), "failed to withdraw stake");
    } else {
      emit UnbondingRequested(unbondingID, delegatorAddr, transcoderAddr, now + unbondingPeriod, amount);
      delegator.unbondingRequests[unbondingID] = UnbondingRequest(transcoderAddr, now, amount);
    }
    return unbondingID;
  }

  /**
  * @notice Withdraw first pending unbonding request.
  * @dev Callable by both tcoders & delegators.
  * Delegators can also withdraw no matter what the tcoder state is if they made an unbonding requested and the wait period passed.
  * If transfer cannot be withdrawn transaction will fail.
  */
  function withdrawPending() external {
    Delegator storage delegator = delegators[msg.sender];
    require(delegator.pending < delegator.next, "no pending requests");
    require(withdrawStake(delegator.pending), "failed to withdraw stake");
    delegator.pending = delegator.pending.add(1);
  }

  /**
  * @notice Withdraw all pending unbonding requests.
  * @dev Callable by both tcoders & delegators.
  * Delegators can also withdraw no matter what the tcoder state is if they made an unbonding requested and the wait period passed.
  * Silently returns if there are no pending transfers that can be withdrawn.
  */
  function withdrawAllPending() external {
    Delegator storage delegator = delegators[msg.sender];
    require(delegator.pending < delegator.next, "no pending requests");
    for (uint256 i = delegator.pending; i < delegator.next; i++) {
      bool executed = withdrawStake(i);
      if (!executed) return;
      delegator.pending = delegator.pending.add(1);
    }
  }

  /**
  * @notice Query state if there are any pending withdrawals ready to be executed.
  */
  function pendingWithdrawalsExist() external view returns (bool) {
    Delegator storage delegator = delegators[msg.sender];
    for (uint256 i = delegator.pending; i < delegator.next; i++) {
      UnbondingRequest storage request = delegator.unbondingRequests[i];
      if (now - request.timestamp >= unbondingPeriod) return true;
    }
    return false;
  }

  /**
  * @notice Withdraw stake in transcoder.
  * @dev Callable by both tcoders & delegators.
  * Delegators can also withdraw no matter what the tcoder state is if they made an unbonding requested and the wait period passed.
  * @param unbondingID ID of unbonding request
  */
  function withdrawStake(uint256 unbondingID) internal returns (bool) {
    address payable delegatorAddr = msg.sender;

    Delegator storage delegator      = delegators[delegatorAddr];
    UnbondingRequest storage request = delegator.unbondingRequests[unbondingID];

    if (request.amount == 0) return false;
    if (now - request.timestamp < unbondingPeriod) return false;

    // apply lazy slash on unbonding request
    Transcoder storage transcoder = transcoders[request.transcoder];
    uint256 start = request.timestamp;
    uint256 end   = start.add(unbondingPeriod);

    uint256 totalSlash = 0;
    for(uint256 i = 0; i < transcoder.slashes.length; ++i) {
      Slash storage slash = transcoder.slashes[i];
      uint256 slashStamp  = slash.timestamp;
      if(slashStamp < start || slashStamp > end) continue;

      uint256 slashedAmount = request.amount.mul(slash.rate);
      slashedAmount = slashedAmount.div(100);
      request.amount = request.amount.sub(slashedAmount);

      totalSlash = totalSlash.add(slashedAmount);
    }
    slashPoolAddress.transfer(totalSlash);

    uint256 requested = request.amount;
    request.amount = 0;

    delegatorAddr.transfer(requested);
    emit StakeWithdrawal(unbondingID, delegatorAddr, request.transcoder, requested);
    return true;
  }

  /**
  * @notice Getter for unbonding requests
  * @dev If the request does not exist all the fields will be 0
  * @param delegatorAddr delegator address
  * @param unbondingID unbonding request ID for which to rebond
  */
  function getUnbondingRequest(address delegatorAddr, uint256 unbondingID) external view returns (UnbondingRequest memory) {
    Delegator storage delegator = delegators[delegatorAddr];
    return delegator.unbondingRequests[unbondingID];
  }

  /**
  * @notice Slash the transcoder stake including it`s delegators.
  * @dev Callable only by a staking manager. Increments the slash counter for lazy slashing of delegators.
  * Transcoder total stake is slashed when method is called.
  * Actual delegator stake values are updated lazily when withdraw, delegate or unbond are called.
  * @param addr transcoder address
  */
  function slash(address addr) external onlyOwner() returns (bool) {
    Transcoder storage transcoder = transcoders[addr];

    require(addr != address(0), "can't use zero address");
    require(transcoder.timestamp > 0, "Registered transcoder only");

    // Can`t slash when already unboded
    TranscoderState state = getTranscoderState(addr);

    if(state != TranscoderState.BONDED && state != TranscoderState.UNBONDING) return false;

    uint256 slashedAmount = transcoder.total.mul(slashRate); // user correct rate
    slashedAmount         = slashedAmount.div(100);
    transcoder.total      = transcoder.total.sub(slashedAmount);
    transcoder.slashes.push(Slash(now, slashRate));

    jail(addr);

    emit Slashed(addr, slashRate);

    return true;
  }

  /**
  * @notice Applies slashing.
  * @dev Lazy slash for delegators stakes.
  * Callable from anywhere; if conditions are met it will execute.
  * Applied during bonding or unbonding.
  * @param transcoderAddr transcoder address
  * @param delegatorAddr delegator address
  */
  function applySlash(address transcoderAddr, address delegatorAddr) internal {
    Transcoder storage transcoder = transcoders[transcoderAddr];
    Delegator storage delegator = delegators[delegatorAddr];

    uint256 transcoderSlashes = transcoder.slashes.length;

    uint256 slashedAmount = getSlashableAmount(transcoderAddr, delegatorAddr);
    delegator.bondedAmounts[transcoderAddr] = delegator.bondedAmounts[transcoderAddr].sub(slashedAmount);

    delegator.slashCounters[transcoderAddr] = transcoderSlashes;

    slashPoolAddress.transfer(slashedAmount);
  }

  /**
  * @notice Returns ammount that is up for slashing of a delegator`s stake.
  * @dev Used for lazy slash for delegators stakes and to compute the real bonded value of the stake
  * @param transcoderAddr transcoder address
  * @param delegatorAddr delegator address
  */
  function getSlashableAmount(address transcoderAddr, address delegatorAddr) public view returns(uint256) {
    Transcoder storage transcoder = transcoders[transcoderAddr];
    Delegator storage delegator = delegators[delegatorAddr];

    uint256 delegatorSlashes = delegator.slashCounters[transcoderAddr];
    uint256 transcoderSlashes = transcoder.slashes.length;

    uint256 slashable = 0;

    if(delegatorSlashes >= transcoderSlashes) // we are up to date with slashing
      return slashable;

    for(uint256 i = delegatorSlashes; i < transcoderSlashes; ++i ) {
      uint256 rate = transcoder.slashes[i].rate;
      uint256 slashedAmount = delegator.bondedAmounts[transcoderAddr].mul(rate);
      slashedAmount = slashedAmount.div(100);
      slashable = slashable.add(slashedAmount);
    }

    return slashable;
  }

  /**
  * @notice Jail a transcoder.
  * @dev Called when slashing
  * @param transcoderAddr transcoder address
  */
  function jail(address transcoderAddr) internal onlyOwner() {
    require(transcoderAddr != address(0), "can't use zero address");
    Transcoder storage transcoder = transcoders[transcoderAddr];
    require(transcoder.timestamp > 0, "Registered transcoder only");
    transcoder.jailed = true;

    emit Jailed(transcoderAddr);
  }

    /**
  * @notice Unjail a transcoder.
  * @dev
  * @param transcoderAddr transcoder address
  */
  function unjail(address transcoderAddr) external onlyOwner() {
    require(transcoderAddr != address(0), "can't use zero address");
    Transcoder storage transcoder = transcoders[transcoderAddr];
    require(transcoder.timestamp > 0, "Registered transcoder only");
    transcoder.jailed = false;

    emit Unjailed(transcoderAddr);
  }

  /**
  * @notice Get total amount staked for a transcoder
  * @dev
  * @param _addr transcoder address
  */
  function getTotalStake(address _addr) public view returns (uint256) {
    require(_addr != address(0), "can't use zero address");
    return transcoders[_addr].total;
  }

  /**
  * @notice Get transcoder self-stake
  * @dev
  * @param _addr transcoder address
  */
  function getSelfStake(address _addr) public view returns (uint256) {
    return getDelegatorStake(_addr, _addr);
  }

  /**
  * @notice Get delegator stake in a transcoder
  * @dev
  * @param transcoderAddr transcoder address
  * @param delegAddr delegator address
  */
  function getDelegatorStake(address transcoderAddr, address delegAddr) public view returns (uint256) {
    require(transcoderAddr != address(0), "can't use zero address");
    require(delegAddr != address(0), "can't use zero address");
    uint256 slashable = getSlashableAmount(transcoderAddr, delegAddr);
    return delegators[delegAddr].bondedAmounts[transcoderAddr].sub(slashable);
  }

  /**
  * @notice Get number of slashes applied to a transcoder
  * @dev
  * @param transcoderAddr transcoder address
  */
  function getTrancoderSlashes(address transcoderAddr) public view returns (uint256) {
    require(transcoderAddr != address(0), "can't use zero address");
    Transcoder storage transcoder = transcoders[transcoderAddr];
    require(transcoder.timestamp > 0, "Transcoder not registered");
    return transcoder.slashes.length;
  }

  /**
  * @notice Get number of registered transcoders.
  **/
  function transcodersCount() external view returns (uint256) {
    return transcodersArray.length;
  }

  /**
  * @notice Get the transcoder state
  * @dev Used by miner sleection, slashing, rewards. enum TranscoderState { BONDING, BONDED, UNBONDED }
  * @param transcoderAddr transcoder address
  */
  function getTranscoderState(address transcoderAddr) public view returns (TranscoderState) {
    require(transcoderAddr != address(0), "can't use zero address");

    Transcoder storage transcoder = transcoders[transcoderAddr];
    Delegator storage delegator   = delegators[transcoderAddr];

    require(transcoder.timestamp > 0, "Transcoder not registered");

    if(transcoder.jailed)
      return TranscoderState.UNBONDED;

    if(now - transcoder.timestamp >= transcoderApprovalPeriod) {
      if (delegator.bondedAmounts[transcoderAddr] >= minSelfStake) {
        return TranscoderState.BONDED;
      }
      else {
        // iff sum of incomplete self-stake unbonding requests plus bondedAmount higher than min self stake
        uint256 sum = 0;
        for (uint256 i = delegator.pending; i < delegator.next; i++) {
          UnbondingRequest storage request = delegator.unbondingRequests[i];
          if (request.transcoder != transcoderAddr) continue;
          if (now - request.timestamp < unbondingPeriod) {
            sum = sum.add(request.amount);
          }
        }
        if (sum.add(delegator.bondedAmounts[transcoderAddr]) >= minSelfStake) {
          return TranscoderState.UNBONDING;
        }
      }
    }
    return TranscoderState.BONDING;
  }

  /**
  * @notice Gettter for jailed state
  * @dev
  * @param transcoderAddr transcoder address
  */
  function isJailed(address transcoderAddr) public view returns (bool) {
    require(transcoderAddr != address(0), "can't use zero address");

    Transcoder storage transcoder = transcoders[transcoderAddr];
    require(transcoder.timestamp > 0, "Transcoder not registered");

    return transcoder.jailed;
  }
}