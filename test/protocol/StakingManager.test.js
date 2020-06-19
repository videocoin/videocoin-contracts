/* global artifacts, contract, describe, it, beforeEach, web3, assert, require */
/* eslint no-unused-expressions: 0 */
/* eslint no-unused-vars: 0 */
const StakingManager = artifacts.require('./StakingManager.sol');

const truffleAssert = require('truffle-assertions');

const { BN, toBN } = web3.utils;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

const {
  vidcoin,
  addSeconds,
  EVMError
} = require('../utils');

// can`t get the enum from contract w/ web3
const TranscoderState = {
  BONDING: toBN(0),
  BONDED: toBN(1),
  UNBONDED: toBN(2),
  UNBONDING: toBN(3)
}

const oneday = toBN(86400);
const oneSec = toBN(1);
const zero = vidcoin(toBN(0));
const onevid = vidcoin(toBN(1));
const sixvids = vidcoin(toBN(6))
const tenvids = vidcoin(toBN(10));

const minDelegation = sixvids;
const minSelfDelegation = tenvids;
const approvalPeriod = 5;
const unbondingPeriod = 10;
const slashRate = 50;
const rewardRate = 10;

contract('StakingManager', (
  [
    _,
    manager,
    delegator,
    delegator2,
    slashFund,
    transcoder,
  ]
) => {
  beforeEach('initialize contracts', async () => {
    this.stakingManager = await StakingManager.new(minDelegation, minSelfDelegation, approvalPeriod, unbondingPeriod, slashRate, slashFund, {transcoders: []}, { from: manager });
  });

  describe('StakingManager', () => {
    it('should be deployed correctly', async () => {
      assert.notEqual(this.stakingManager, null, "stakingManager not deployed");
    });

    it('should allow contract manager to set new min stake', async () => {
      // when manager whishes to set a new min stake
      await this.stakingManager.setSelfMinStake(minSelfDelegation, { from: manager });

      // then
      const newStake = await this.stakingManager.minSelfStake();
      newStake.should.be.bignumber.equal(minSelfDelegation);
    });
  });

  describe('Apply snapshot', () => {
    it('transcoders from snapshot should remain in the same state', async () => {
        const snapshot = [
            {addr: transcoder,
             total: minSelfDelegation.toString(),
             timestamp: 1,
             rewardRate: 1,
             zone: 1,
             capacity: 100,
             effectiveMinSelfStake: minSelfDelegation.toString(),
            },
        ];
        const recovered = await StakingManager.new(minDelegation, minSelfDelegation, approvalPeriod, unbondingPeriod, slashRate, slashFund, {transcoders: snapshot}, { from: manager, value: minSelfDelegation});
        const bonded = await recovered.getTranscoderState(transcoder);
        bonded.should.be.bignumber.equal(TranscoderState.BONDED);
    });
  });

  describe('TranscodersArray', () => {
    it('should be able to get transcoder using index in array', async () => {
      await this.stakingManager.registerTranscoder(rewardRate, { from: transcoder });

      var count = await this.stakingManager.transcodersCount();
      count.should.be.bignumber.equal(new BN(1));

      await this.stakingManager.registerTranscoder(rewardRate, { from: delegator });
      count = await this.stakingManager.transcodersCount();
      count.should.be.bignumber.equal(new BN(2));

      var address = await this.stakingManager.transcodersArray(new BN(0));
      address.should.be.equal(transcoder);

      address = await this.stakingManager.transcodersArray(new BN(1));
      address.should.be.equal(delegator);
    });
  })

  describe('Transcoder', () => {

    beforeEach('initialize contracts', async () => {
      await this.stakingManager.registerTranscoder(rewardRate, { from: transcoder });
    });

    it('should be able to register transcoder and transcoder be BONDING', async () => {
      // when

      // then
      const isBondedTranscoder = await this.stakingManager.getTranscoderState(transcoder);
      isBondedTranscoder.should.be.bignumber.equal(TranscoderState.BONDING);
    });

    it('should not be BONDED if approval period has not passed', async () => {
      // when
      await addSeconds(approvalPeriod - 1);

      // then
      let isBondedTranscoder = await this.stakingManager.getTranscoderState(transcoder);
      isBondedTranscoder.should.not.be.bignumber.equal(TranscoderState.BONDED);
    });

    it('should not be BONDED when self stake is bellow minimum', async () => {
      // when
      await addSeconds(approvalPeriod);
      await this.stakingManager.delegate(transcoder, { from: delegator, value: minSelfDelegation });

      // then
      const isBondedTranscoder = await this.stakingManager.getTranscoderState(transcoder);
      isBondedTranscoder.should.not.be.bignumber.equal(TranscoderState.BONDED);
    });

    it('should be BONDED when self stake is above minimum and approval period passed', async () => {
      // when
      await addSeconds(approvalPeriod);
      await this.stakingManager.delegate(transcoder, { from: delegator, value: minSelfDelegation });

      // then
      const isBondedTranscoder = await this.stakingManager.getTranscoderState(transcoder);
      isBondedTranscoder.should.not.be.bignumber.equal(TranscoderState.BONDED);
    });

   it('should be BONDED after minSelfStake increase', async() => {
      await addSeconds(approvalPeriod);
      var isBondedTranscoder = await this.stakingManager.getTranscoderState(transcoder);
      isBondedTranscoder.should.not.be.bignumber.equal(TranscoderState.BONDED);

      await this.stakingManager.setSelfMinStake(tenvids, {from: manager});

      isBondedTranscoder = await this.stakingManager.getTranscoderState(transcoder);
      isBondedTranscoder.should.not.be.bignumber.equal(TranscoderState.BONDED);
   });
  });

  describe('Delegations', () => {
    beforeEach('register transcoder', async () => {
      await this.stakingManager.registerTranscoder(rewardRate, { from: transcoder });
      await addSeconds(approvalPeriod);
    });

    it('should be able to delegate to a registered transcoder', async () => {
      // given
      // when
      await this.stakingManager.delegate(transcoder, { from: delegator, value: minDelegation });

      // then
      const stake = await this.stakingManager.getDelegatorStake(transcoder, delegator);
      const totalStake = await this.stakingManager.getTotalStake(transcoder);

      stake.should.be.bignumber.equal(minDelegation)
      totalStake.should.be.bignumber.equal(minDelegation);
    });

    it('should not reject delegations if transcoder is not registered', async () => {
      await this.stakingManager.delegate(transcoder, { from: delegator, value: minDelegation });

      const totalStake = await this.stakingManager.getTotalStake(transcoder);
      totalStake.should.be.bignumber.equal(minDelegation);
    });

    it('transcoder should be able to self delegate', async () => {
      // given
      // when
      await this.stakingManager.delegate(transcoder, { from: transcoder, value: minDelegation });

      // then
      const totalStake = await this.stakingManager.getTotalStake(transcoder);
      totalStake.should.be.bignumber.equal(minDelegation)
    });

    it('should not accept delegations below required minimal amount ', async () => {
      // given
      // when
      const expectedError = this.stakingManager.delegate(transcoder, { from: delegator, value: onevid });

      // then
      await expectedError.should.be.eventually.rejectedWith(EVMError('revert'));
    });

  });

  describe('Withdrawals', () => {
    beforeEach('register transcoder', async () => {
      await this.stakingManager.registerTranscoder(rewardRate, { from: transcoder });
      await addSeconds(approvalPeriod);
    });

    it('delegator should be able to withdraw its stake', async () => {
      // given
      var balanceBefore = new BN(await web3.eth.getBalance(delegator));
      var gas = new BN(0);

      var result = await this.stakingManager.delegate(transcoder, { from: delegator, value: minDelegation });
      var tx = await web3.eth.getTransaction(result.tx);
      gas = gas.add(toBN(result.receipt.cumulativeGasUsed).mul(toBN(tx.gasPrice)));

      result = await this.stakingManager.requestUnbonding(transcoder, minDelegation, { from: delegator });
      tx = await web3.eth.getTransaction(result.tx);
      gas = gas.add(toBN(result.receipt.cumulativeGasUsed).mul(toBN(tx.gasPrice)));

      const balanceAfter = new BN(await web3.eth.getBalance(delegator));
      balanceAfter.should.bignumber.be.equal(balanceBefore.sub(gas));
    });

    it('should display correct stake values when unbonding was requested', async () => {
      // given an unbonding was requested
      await this.stakingManager.delegate(transcoder, { from: delegator, value: minDelegation });
      const unbondStake = minDelegation.div(toBN(2));
      const totalPrev = await this.stakingManager.getTotalStake(transcoder);
      await this.stakingManager.requestUnbonding(transcoder, unbondStake, { from: delegator });

      // when the stake values are queried
      const total = await this.stakingManager.getTotalStake(transcoder);
      const stake = await this.stakingManager.getDelegatorStake(transcoder, delegator);

      // then they should reflect the unbonding
      stake.should.be.bignumber.equal(unbondStake);
      total.should.be.bignumber.equal(totalPrev.sub(unbondStake))
    });

    it('should reject unbonding request if already unbonded entire stake', async () => {
      // given
      await this.stakingManager.delegate(transcoder, { from: delegator, value: minDelegation });
      await this.stakingManager.requestUnbonding(transcoder, minDelegation, { from: delegator });
      // when
      const expectedError = this.stakingManager.requestUnbonding(transcoder, minDelegation, { from: delegator });

      // then
      await expectedError.should.be.eventually.rejectedWith(EVMError('revert'));
    });

    it('delegator should be able to withdraw multiple stakes in one withdraw tx', async () => {
      await this.stakingManager.delegate(transcoder, { from: transcoder, value: minSelfDelegation });
      await this.stakingManager.delegate(transcoder, { from: delegator, value: minDelegation });
      await this.stakingManager.delegate(transcoder, { from: delegator, value: minDelegation });
      await this.stakingManager.delegate(transcoder, { from: delegator, value: minDelegation });

      // when
      await this.stakingManager.requestUnbonding(transcoder, minDelegation, { from: delegator });
      await this.stakingManager.requestUnbonding(transcoder, minDelegation, { from: delegator });

      const stake = await this.stakingManager.getDelegatorStake(transcoder, delegator);
      stake.should.be.bignumber.equal(minDelegation);
    });

    it('should fail if nothing to withdraw', async () => {
      await truffleAssert.reverts(this.stakingManager.withdrawPending({from: delegator}), "no pending requests");
    });

    it('transcoder shouldnt be able to withdraw stake bypassing unboding period', async() => {
        await this.stakingManager.delegate(transcoder, { from: transcoder, value: minSelfDelegation });
        var state = await this.stakingManager.getTranscoderState(transcoder, {from: transcoder});
        state.should.be.bignumber.equal(TranscoderState.BONDED);

        var part = minSelfDelegation.div(new BN(5));
        await this.stakingManager.requestUnbonding(transcoder, part, {from: transcoder})

        state = await this.stakingManager.getTranscoderState(transcoder, {from: transcoder});
        state.should.be.bignumber.equal(TranscoderState.UNBONDING);

        await this.stakingManager.requestUnbonding(transcoder, minSelfDelegation.sub(part), {from: transcoder});
        var exist = await this.stakingManager.pendingWithdrawalsExist({from: transcoder});
        exist.should.be.false;

        await addSeconds(unbondingPeriod);
        exist = await this.stakingManager.pendingWithdrawalsExist({from: transcoder});
        exist.should.be.true;
        await this.stakingManager.withdrawAllPending({from: transcoder});
    })

    it('should not be allowed to withdraw before unbonding period passes', async () => {
      // given the delegator delegates to a bonded transcoder
      await this.stakingManager.delegate(transcoder, { from: transcoder, value: minSelfDelegation });
      await this.stakingManager.delegate(transcoder, { from: delegator, value: minDelegation });

      // when
      const ret = await this.stakingManager.requestUnbonding(transcoder, minDelegation, { from: delegator });

      // 1 second is not enough
      await addSeconds(unbondingPeriod - 100);
      await truffleAssert.reverts(this.stakingManager.withdrawPending({from: delegator}), "failed to withdraw stake");
    });

    it('transcoder should be able to withdraw self stake', async () => {
      // given that a transcoder made a unbonding request for its self stake
      const balanceBefore = Math.floor((await web3.eth.getBalance(transcoder)) / 1e18);

      await this.stakingManager.delegate(transcoder, { from: transcoder, value: minSelfDelegation });
      const state = await this.stakingManager.getTranscoderState(transcoder);
      state.should.be.bignumber.equal(TranscoderState.BONDED);

      await this.stakingManager.requestUnbonding(transcoder, minSelfDelegation, { from: transcoder });

      // when the unbonding period experied and the transcoder withdraws
      await addSeconds(unbondingPeriod);
      await this.stakingManager.withdrawPending({from: transcoder});

      // then the transcoder will receive the requested funds
      const balanceAfter = Math.floor((await web3.eth.getBalance(transcoder)) / 1e18);
      balanceAfter.should.be.equal(balanceBefore);
    });

  });

  describe('Slashing', () => {
    beforeEach('register transcoder', async () => {
      await this.stakingManager.registerTranscoder(rewardRate, { from: transcoder });
      await this.stakingManager.delegate(transcoder, { from: transcoder, value: minSelfDelegation });
    });

    it('should not be slashed by a different account then the manager account', async () => {
      // when a different account than the staking manager calls slash()
      const expectedError = this.stakingManager.slash(transcoder, { from: delegator });

      // then we get a revert
      await expectedError.should.be.eventually.rejectedWith(EVMError('revert'));
    });

    it('should not be able to slash if transcoder is BONDING', async () => {
      // given the transcoder is bonding
      const isBondedTranscoder = await this.stakingManager.getTranscoderState(transcoder);
      isBondedTranscoder.should.be.bignumber.equal(TranscoderState.BONDING);

      // when call slash()
      const slashed = await this.stakingManager.slash.call(transcoder, { from: manager });

      // then the slash won`t execute
      slashed.should.be.false;
    });

    it('should not be able to slash if transcoder is UNBONDED', async () => {
      // given the transcoder is unbonded
      await addSeconds(approvalPeriod);
      await this.stakingManager.slash(transcoder, { from: manager });

      const isBondedTranscoder = await this.stakingManager.getTranscoderState(transcoder);
      isBondedTranscoder.should.be.bignumber.equal(TranscoderState.UNBONDED);

      // when we call slash()
      const slashed = await this.stakingManager.slash.call(transcoder, { from: manager });

      // then the slash won`t execute
      slashed.should.be.false;
    });

    it('should slash total stake correctly if transcoder is BONDED', async () => {
      // given transcoder is bonded
      await addSeconds(approvalPeriod);
      const stakeBeforeSlashing = await this.stakingManager.getTotalStake(transcoder);

      // when transcoder gets slashed
      const slashed = await this.stakingManager.slash.call(transcoder, { from: manager });
      slashed.should.be.true;

      await this.stakingManager.slash(transcoder, { from: manager });

      // then it`s total stake is reduced by the set rate
      const stakeAfterSlashing = await this.stakingManager.getTotalStake(transcoder);
      const expectedStake = stakeBeforeSlashing.mul(toBN(slashRate)).div(toBN(100));

      stakeAfterSlashing.should.be.bignumber.equal(expectedStake);
    });

    it('should slash delegator`s stake correctly', async () => {
      // given transcoder is bonded
      await addSeconds(approvalPeriod);
      const stakeBeforeSlashing = await this.stakingManager.getDelegatorStake(transcoder, delegator);

      // when transcoder gets slashed
      await this.stakingManager.slash(transcoder, { from: manager });

      // then the transcoder stake is reduced by the set rate
      const stakeAfterSlashing = await this.stakingManager.getDelegatorStake(transcoder, delegator);
      const expectedStake = stakeBeforeSlashing.mul(toBN(slashRate)).div(toBN(100));

      stakeAfterSlashing.should.be.bignumber.equal(expectedStake);
    });

    it('should be able to query the number of slashes that have been applied to the transcoder', async () => {
      // given transcoder is bonded
      await addSeconds(approvalPeriod);
      const stakeBeforeSlashing = await this.stakingManager.getDelegatorStake(transcoder, delegator);

      // when transcoder gets slashed
      // then when we query the slash counter we get the correct value
      await this.stakingManager.slash(transcoder, { from: manager });
      let slashes = await this.stakingManager.getTrancoderSlashes(transcoder, { from: manager });
      slashes.should.be.bignumber.equal(toBN(1))

      // allow the transcoder to bond again
      await this.stakingManager.unjail(transcoder, { from: manager });

      await this.stakingManager.slash(transcoder, { from: manager });
      slashes = await this.stakingManager.getTrancoderSlashes(transcoder, { from: manager });
      slashes.should.be.bignumber.equal(toBN(2))
    });

    it('should become UNBONDDED and jailed when slashed', async () => {
      // given
      await addSeconds(approvalPeriod);

      // when
      await this.stakingManager.slash(transcoder, { from: manager });

      // then
      const isBondedTranscoder = await this.stakingManager.getTranscoderState(transcoder);
      isBondedTranscoder.should.be.bignumber.equal(TranscoderState.UNBONDED);

      const isJailed = await this.stakingManager.isJailed(transcoder);
      isJailed.should.be.true;
    });

    it('should send slashed funds to the slash pool address after (lazy) slash executed', async () => {
      // given transcoder is bonded
      await addSeconds(approvalPeriod);

      const before = toBN(await web3.eth.getBalance(slashFund));
      const stakeBeforeSlashing = await this.stakingManager.getTotalStake(transcoder);
      const expectedSlash = stakeBeforeSlashing.mul(toBN(slashRate)).div(toBN(100));

      // when transcoder gets slashed & the slash is executed (i.e. by calling delegate())
      await this.stakingManager.slash(transcoder, { from: manager });
      await this.stakingManager.delegate(transcoder, { from: transcoder, value: minSelfDelegation });

      // then the slashed funds got to the slash fund address
      const after = toBN(await web3.eth.getBalance(slashFund));
      after.should.bignumber.equal(before.add(expectedSlash));
    });

    it('should slash unbonding requests if necessary', async () => {
      // given that a delegator requested an unbonding and a slashing occured during the unbonding period
      await addSeconds(approvalPeriod);

      await this.stakingManager.requestUnbonding(transcoder, minDelegation, { from: transcoder });

      const balanceBefore = Math.floor((await web3.eth.getBalance(transcoder)) / 1e18);

      await this.stakingManager.slash(transcoder, { from: manager });

      // when the delegator withdraws its funds
      await addSeconds(unbondingPeriod);
      await this.stakingManager.withdrawPending({ from: transcoder });

      // then the amount requested in the unbonding request gets slashed by the set rate
      const balanceAfter = Math.floor((await web3.eth.getBalance(transcoder)) / 1e18);
      const expectedWithdraw = parseInt(web3.utils.fromWei(sixvids.mul(toBN(slashRate)).div(toBN(100))));
      balanceAfter.should.be.equal(balanceBefore + expectedWithdraw);
    });

    it('should be able to unjail transcoder', async () => {
      // given
      await addSeconds(approvalPeriod);
      await this.stakingManager.slash(transcoder, { from: manager });

      // when
      await this.stakingManager.unjail(transcoder, { from: manager });

      // then
      const isJailed = await this.stakingManager.isJailed(transcoder);
      isJailed.should.be.false;
    });
  });
});
