const PaymentManager = artifacts.require("./PaymentManager.sol");

const truffleAssert = require("truffle-assertions");
const BN = web3.utils.BN;
require("chai")
  .use(require("chai-as-promised"))
  .use(require('chai-bn')(BN))
  .should();

const { ZERO_BYTES32, ZERO_ADDRESS } = require("../utils");

contract("payment-manager", ([managerAcc, signerAcc, maliciousAcc]) => {
  beforeEach("initialize contract", async () => {
    this.manager = await PaymentManager.new({ from: managerAcc });
  });

  describe("test payment manager contract", () => {
    const localTx =
      "0x0000000000000000000000000000000000000000000000000000000000000001";
    const foreignTx =
      "0x1000000000000000000000000000000000000000000000000000000000000000";
    const localTx2 =
      "0x0000000000000000000000000000000000000000000000000000000000000002";
    const foreignTx2 =
      "0x2000000000000000000000000000000000000000000000000000000000000000";
    const localTx3 =
      "0x0000000000000000000000000000000000000000000000000000000000000003";
    const foreignTx3 =
      "0x3000000000000000000000000000000000000000000000000000000000000000";
    const emptyStatus = 0;
    const pendingStatus = 1;
    const failedStatus = 2;
    const successStatus = 3;
    const nonce = 1023;

    it("should be deployed correctly", async () => {
      assert.notEqual(this.manager, null, "manager not deployed");
    });

    it("should have the deployer account returned as owner", async () => {
      managerAcc.should.be.equal(await this.manager.owner());
    });

    it("should be able to add new payment record with pending status", async () => {
      const res = await this.manager.submitPending(
        signerAcc,
        nonce,
        localTx,
        foreignTx
      );

      const transfer = await this.manager.transfers(localTx);
      transfer.hash.should.equal(foreignTx);
      transfer.nonce.toNumber().should.equal(nonce);
      transfer.state.toNumber().should.equal(pendingStatus);

      // Then it should emit the required events
      truffleAssert.eventEmitted(res, "PendingTransfer", (ev) => {
        return (
          ev.signer == signerAcc && ev.nonce == nonce && ev.txHash == localTx
        );
      });
    });

    it("should be able to change payment status to success", async () => {
      await this.manager.submitPending(signerAcc, nonce, localTx, foreignTx);
      const res = await this.manager.submitSuccess(localTx, foreignTx);

      const transfer = await this.manager.transfers(localTx);
      transfer.state.toNumber().should.equal(successStatus);
      transfer.hash.should.equal(foreignTx);

      // Then it should emit the required event
      truffleAssert.eventEmitted(res, "TxSuccess", (ev) => {
        return ev.local == localTx && ev.foreign == foreignTx;
      });
    });

    it("should be able to change payment status to failed", async () => {
      await this.manager.submitPending(signerAcc, nonce, localTx, foreignTx);
      const res = await this.manager.submitFailed(localTx, foreignTx);

      const transfer = await this.manager.transfers(localTx);
      transfer.state.toNumber().should.equal(failedStatus);
      transfer.hash.should.equal(foreignTx);

      // Then it should emit the required event
      truffleAssert.eventEmitted(res, "TxFailed", (ev) => {
        return ev.local == localTx && ev.foreign == foreignTx;
      });
    });

    it("should be able to request retry", async () => {
      await this.manager.submitPending(signerAcc, nonce, localTx, foreignTx);
      await this.manager.submitFailed(localTx, foreignTx);
      let transfer = await this.manager.transfers(localTx);
      transfer.state.toNumber().should.equal(failedStatus);

      const res = await this.manager.requestRetry(localTx);

      // And remove record from the map
      transfer = await this.manager.transfers(localTx);
      transfer.state.toNumber().should.equal(emptyStatus);

      // Then it should emit the required events
      truffleAssert.eventEmitted(res, "Retry", (ev) => {
        return ev.txHash == localTx;
      });
    });

    it("should be able to create multiple records", async () => {
      await this.manager.submitPending(signerAcc, nonce, localTx, foreignTx);
      await this.manager.submitPending(signerAcc, nonce, localTx2, foreignTx2);
      await this.manager.submitPending(signerAcc, nonce, localTx3, foreignTx3);
    });

    it("should only allow owner to manage records", async () => {
      await truffleAssert.reverts(
        this.manager.submitPending(signerAcc, nonce, localTx, foreignTx, {
          from: maliciousAcc,
        })
      );
      await truffleAssert.reverts(
        this.manager.submitSuccess(localTx, foreignTx, { from: maliciousAcc })
      );
      await truffleAssert.reverts(
        this.manager.submitFailed(localTx, foreignTx, { from: maliciousAcc })
      );
      await truffleAssert.reverts(
        this.manager.requestRetry(localTx, { from: maliciousAcc })
      );
    });

    it("should not allow to update record if it was not stored", async () => {
      await truffleAssert.reverts(
        this.manager.submitSuccess(localTx, foreignTx),
        "record is uninitialized"
      );
      await truffleAssert.reverts(
        this.manager.submitFailed(localTx, foreignTx),
        "record is uninitialized"
      );
      await truffleAssert.reverts(
        this.manager.requestRetry(localTx),
        "only failed records"
      );
    });

    it("should allow to store different transaction for same transfer twice", async () => {
      await this.manager.submitPending(signerAcc, nonce, localTx, foreignTx);
      await this.manager.submitPending(signerAcc, nonce, localTx, foreignTx2);
    });

    it("should not allow to store record with invalid signer address", async () => {
      await truffleAssert.reverts(
        this.manager.submitPending(ZERO_ADDRESS, nonce, localTx, foreignTx),
        "invalid address"
      );
    });

    it("should not allow to store record with invalid transaction hash", async () => {
      await truffleAssert.reverts(
        this.manager.submitPending(signerAcc, nonce, ZERO_BYTES32, foreignTx),
        "invalid local tx hash"
      );
      await truffleAssert.reverts(
        this.manager.submitPending(signerAcc, nonce, localTx, ZERO_BYTES32),
        "invalid foreign tx hash"
      );
    });

    it("should not allow to update the record with invalid transaction hash", async () => {
      await truffleAssert.reverts(
        this.manager.submitFailed(ZERO_BYTES32, foreignTx),
        "invalid local tx hash"
      );
      await truffleAssert.reverts(
        this.manager.submitFailed(localTx, ZERO_BYTES32),
        "invalid foreign tx hash"
      );

      await truffleAssert.reverts(
        this.manager.submitSuccess(ZERO_BYTES32, foreignTx),
        "invalid local tx hash"
      );
      await truffleAssert.reverts(
        this.manager.submitSuccess(localTx, ZERO_BYTES32),
        "invalid foreign tx hash"
      );

      await truffleAssert.reverts(
        this.manager.requestRetry(ZERO_BYTES32),
        "invalid tx hash"
      );
    });
  });
});
