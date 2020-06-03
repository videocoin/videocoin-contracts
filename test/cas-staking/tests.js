const StakingManager = artifacts.require("./StakingManager.sol");
const CASStaking = artifacts.require("./CASStaking.sol");

const truffleAssert = require("truffle-assertions");
const { BN, toBN } = web3.utils;
require("chai")
  .use(require("chai-as-promised"))
  .use(require('chai-bn')(BN))
  .should();

const ChangeType = {
  DEPOSIT: toBN(0),
  WITHDRAW: toBN(1)
}

const zero = toBN(0);

contract("cas staking", ([owner, delegator, transcoder]) => {
    beforeEach("deploy", async () => {
        this.staking = await StakingManager.new(zero, zero, zero, zero, zero, owner, { from: owner })
        this.cas = await CASStaking.new(this.staking.address, { from: owner});
        await this.staking.addManager(this.cas.address, { from: owner });
    });

    describe("test apply changes", () => {
        it("should deposit to transcoder on delegator behalf", async() => {
            const value = toBN(100);
            const deposit = {
                transcoder: transcoder,
                delegator: delegator,
                amount: value.toString(),
                ctype: ChangeType.DEPOSIT.toString(),
            };
            await this.cas.cas(toBN(0), toBN(1), [deposit], {from: owner, value: value});
            var managed = await this.staking.isManaged(delegator);
            managed.should.be.true;
            var stake = await this.staking.getDelegatorStake(transcoder, delegator);
            stake.should.be.bignumber.equal(value);
        });

        it("should deposit and withdraw in the different transactions", async() => {
            const value = toBN(100);
            const deposit = {
                transcoder: transcoder,
                delegator: delegator,
                amount: value.toString(),
                ctype: ChangeType.DEPOSIT.toString(),
            };
            const withdraw = {
                transcoder: transcoder,
                delegator: delegator,
                amount: value.toString(),
                ctype: ChangeType.WITHDRAW.toString(),
            }
            await this.cas.cas(toBN(0), toBN(1), [deposit], {from: owner, value: value});
            const balance = new BN(await web3.eth.getBalance(this.staking.address));
            balance.should.be.bignumber.equal(value);
            await this.cas.cas(toBN(1), toBN(2), [withdraw], {from: owner, value: value});
            var stake = await this.staking.getDelegatorStake(transcoder, delegator);
            stake.should.be.bignumber.equal(zero);
        });

        it("should be possible to withdraw in single transaction", async() => {
            const value = toBN(100);
            const deposit = {
                transcoder: transcoder,
                delegator: delegator,
                amount: value.toString(),
                ctype: ChangeType.DEPOSIT.toString(),
            };
            const withdraw = {
                transcoder: transcoder,
                delegator: delegator,
                amount: value.toString(),
                ctype: ChangeType.WITHDRAW.toString(),
            }
            await this.cas.cas(toBN(0), toBN(1), [deposit, withdraw], {from: owner, value: value});
            var stake = await this.staking.getDelegatorStake(transcoder, delegator);
            stake.should.be.bignumber.equal(zero);
        });
    });
});
