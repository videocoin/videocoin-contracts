const BatchTransfer = artifacts.require("./BatchTransfer.sol");
const ERC20 = artifacts.require("./TestERC.sol");

const truffleAssert = require("truffle-assertions");
const { BN, toBN } = web3.utils;
require("chai")
  .use(require("chai-as-promised"))
  .use(require('chai-bn')(BN))
  .should();


contract("staking escrow", ([owner, acc1, acc2, acc3]) => {
    beforeEach("deploy", async () => {
        this.token = await ERC20.new({ from: owner });
        await this.token.mint(acc1, toBN(1000), { from: owner });
        this.batch = await BatchTransfer.new({ from: owner });
    });

    describe("test batch transfer helper", () => {
        it("should transfer to multiple accoutns", async () => {
            const total = toBN(100);
            const part = toBN(50).toString();
            await this.token.increaseAllowance(this.batch.address, total, { from: acc1 });
            await this.batch.transfer(
                this.token.address,
                total,
                [{to: acc2, amount: part}, {to: acc3, amount: part}],
                { from: acc1 });
            const bal2 = await this.token.balanceOf(acc2);
            bal2.toString().should.equal(part);
            const bal3 = await this.token.balanceOf(acc3);
            bal3.toString().should.equal(part);
        });
    });
});
