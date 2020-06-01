const StakingEscrow = artifacts.require("./StakingEscrow.sol");
const ERC20 = artifacts.require("./TestERC.sol");

const truffleAssert = require("truffle-assertions");
const { BN, toBN } = web3.utils;
require("chai")
  .use(require("chai-as-promised"))
  .use(require('chai-bn')(BN))
  .should();


contract("staking escrow", ([owner, minter, delegator, transcoder, nonfunded]) => {
    beforeEach("deploy", async () => {
        this.token = await ERC20.new({ from: minter });
        await this.token.mint(delegator, toBN(1000), { from: minter });
        this.escrow = await StakingEscrow.new(this.token.address, { from: owner });
    });

    describe("test staking bridge", () => {
        it("should lock approved tokens", async () => {
            const amount = toBN(100);
            await this.token.increaseAllowance(this.escrow.address, amount, { from: delegator });
            await this.escrow.transfer(transcoder, amount, { from: delegator });
            const balance = await this.token.balanceOf(this.escrow.address);
            balance.toNumber().should.equal(amount.toNumber());
        });

        it("should revert if not enough tokens", async () => {
            await truffleAssert.reverts(
                this.escrow.transfer(transcoder, toBN(100), { from: nonfunded })
            );
        });

        it("should be able to withdraw requested tokens", async () => {
            const amount = toBN(100);
            await this.token.increaseAllowance(this.escrow.address, amount, { from: delegator });
            await this.escrow.transfer(transcoder, amount, { from: delegator });
            await this.escrow.transferFrom(transcoder, delegator, amount, { from: delegator });

            const balance = await this.token.balanceOf(this.escrow.address);
            balance.toNumber().should.equal(0);
        });

        it("should revert withdrawing more than locked ", async () => {
            const amount = toBN(100);
            await truffleAssert.reverts(
                this.escrow.transferFrom(transcoder, delegator, amount, { from: delegator })
            );
        });
    });
});
