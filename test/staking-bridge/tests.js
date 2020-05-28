const StakingBridge = artifacts.require("./StakingBridge.sol");
const ERC20 = artifacts.require("./TestERC.sol");

const truffleAssert = require("truffle-assertions");
const { BN, toBN } = web3.utils;
require("chai")
  .use(require("chai-as-promised"))
  .use(require('chai-bn')(BN))
  .should();


contract("staking bridge", ([owner, minter, delegator, transcoder]) => {
    beforeEach("deploy", async () => {
        this.token = await ERC20.new({ from: minter });
        await this.token.mint(delegator, toBN(1000), { from: minter });
        this.bridge = await StakingBridge.new(this.token.address, { from: owner });
    });

    describe("test staking bridge", () => {
        it("should lock approved tokens", async () => {
            const amount = toBN(100);
            await this.token.approve(this.bridge.address, amount, { from: delegator });
            await this.bridge.lock(amount, transcoder, { from: delegator });
            const balance = await this.token.balanceOf(this.bridge.address);
            balance.toNumber().should.equal(amount.toNumber());
        });

        it("should revert locking unapproved ", async () => {
            await truffleAssert.reverts(
                this.bridge.lock(toBN(100), transcoder, { from: delegator })
            );
        });

        it("should be able to withdraw requested and unlocked tokens", async () => {
            const amount = toBN(100);
            await this.token.approve(this.bridge.address, amount, { from: delegator });
            await this.bridge.lock(amount, transcoder, { from: delegator });

            await this.bridge.request(amount, transcoder, { from: delegator });
            await this.bridge.unlock(amount, delegator, transcoder, { from : owner });
            await this.token.transferFrom(this.bridge.address, delegator, amount, { from: delegator });

            const balance = await this.token.balanceOf(this.bridge.address);
            balance.toNumber().should.equal(0);
        });


        it("should revert requesting more than locked ", async () => {
            const amount = toBN(100);
            await this.token.approve(this.bridge.address, amount, { from: delegator });
            await this.bridge.lock(amount, transcoder, { from: delegator });

            await this.bridge.request(amount, transcoder, { from: delegator });

            await truffleAssert.reverts(
                this.bridge.request(toBN(200), transcoder, { from: delegator })
            );
        });
    });
});
