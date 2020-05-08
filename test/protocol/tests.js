const stream = artifacts.require("./Stream.sol");
const streamManager = artifacts.require("./StreamManager.sol");

const semverRegex = require("semver-regex");
const truffleAssert = require("truffle-assertions");
const BN = web3.utils.BN;
require("chai").use(require("chai-as-promised")).should();

const { ensuresException, randInt, ZERO_ADDRESS } = require("../utils");

async function createNewStream(manager, client, managerAcc, profiles, chunks) {
  const id = randInt();
  const value = new BN("10").pow(new BN("19"));

  await manager.requestStream(id, profiles, { from: client });
  await manager.approveStreamCreation(id, { from: managerAcc });
  const res = await manager.createStream(id, { from: client, value });

  const streamAddr = res.receipt.logs[0].args.streamAddress;
  const streamInstance = await stream.at(streamAddr);
  return { stream: streamInstance, streamId: id };
}

const wattage = new BN("10").pow(new BN("16"));
const wattagesArr = Array(10).fill(wattage);

contract(
  "stream",
  ([managerAcc, client, miner, validator, malicious, publisher, anyone]) => {
    // let this.mStream = null;
    let streamId = new BN(1);

    beforeEach("initialize contracts", async () => {
      this.mManager = await streamManager.new({ from: managerAcc });
      this.mStream = null;
    });

    describe("test stream manager", () => {
      const chunks = [new BN(1), new BN(2), new BN(3)];
      const profiles = ["profile1", "profile2", "profile3"];

      it("should be deployed correctly", async () => {
        assert.notEqual(this.mManager, null, "manager not deployed");
      });

      it("should have the deployer account returned as owner", async () => {
        managerAcc.should.be.equal(await this.mManager.owner());
      });

      it("should be able to add validators", async () => {
        // Given that a certain address is not a validator
        let isValidator = await this.mManager.isValidator(validator);
        isValidator.should.be.false;

        // When the manager adds the address
        await this.mManager.addValidator(validator, { from: managerAcc });

        // The the address should show up as a validator
        isValidator = await this.mManager.isValidator(validator);
        isValidator.should.be.true;
      });

      it("should be able to remove validators", async () => {
        // Given that a certain address is a validator
        await this.mManager.addValidator(validator, { from: managerAcc });
        let isValidator = await this.mManager.isValidator(validator);
        isValidator.should.be.true;

        // When the manager removes the address
        await this.mManager.removeValidator(validator, { from: managerAcc });

        // The the address should not show up as a validator anymore
        isValidator = await this.mManager.isValidator(validator);
        isValidator.should.be.false;
      });

      it("should be able to add/remove publisher", async() => {
        await this.mManager.addPublisher(publisher, { from: managerAcc });
        let isPub = await this.mManager.isPublisher(publisher);
        isPub.should.be.true;

        await this.mManager.removePublisher(publisher, { from: managerAcc });
        isPub = await this.mManager.isPublisher(publisher);
        isPub.should.be.false;
      });

      it("should only allow owner to manage validators", async () => {
        // Given we have a stream request

        try {
          // When a malicious address to add or remove validators
          await this.mManager.addValidator(validator, { from: malicious });
          assert.fail();
        } catch (e) {
          // Then the address is denied and the transactions are reversed
          ensuresException(e);
        }

        try {
          await this.mManager.removeValidator(validator, { from: malicious });
          assert.fail();
        } catch (e) {
          ensuresException(e);
        }
      });

      it("shouldn't allow non-publisher to manage stream creation", async () => {
        // Given we have a stream request
        await this.mManager.requestStream.call(streamId, profiles, {
          from: client,
        });

        // When a malicious address tries to approve the request
        try {
          await this.mManager.approveStreamCreation(streamId, {
            from: malicious,
          });
          assert.fail();
        } catch (e) {
          // Then the address is denied and the transactions are reversed
          ensuresException(e);
        }
      });

      it("shouldn't allow non-publisher to manage refunds", async () => {
        // Given we have a stream request
        await this.mManager.requestStream(streamId, profiles, { from: client });

        try {
          // When a malicious address tries to allow  refunds
          await this.mManager.allowRefund(streamId, { from: malicious });
          assert.fail();
        } catch (e) {
          // Then the address is denied and the transactions are reversed
          ensuresException(e);
        }

        try {
          // When a malicious address tries to revoke refunds
          await this.mManager.revokeRefund(streamId, { from: malicious });
          assert.fail();
        } catch (e) {
          // Then the address is denied and the transactions are reversed
          ensuresException(e);
        }
      });

       it("should allow publisher to manage refunds", async () => {
         await this.mManager.addPublisher(publisher, { from: managerAcc });
         await this.mManager.requestStream(streamId, profiles, { from: client });
         await this.mManager.allowRefund(streamId, { from: publisher });
       });
    });

    describe("test Stream contract creation", () => {
      const profiles = ["profile1", "profile2", "profile3"];

      it("should be able to request a stream", async () => {
        // When the client requests a stream
        const res = await this.mManager.requestStream(streamId, profiles, {
          from: client,
        });

        // Then the StreamRequested is emited with correct params
        truffleAssert.eventEmitted(res, "StreamRequested", (ev) => {
          return ev.client == client && ev.streamId.eq(streamId);
        });

        // And the request object has the correct params
        const request = await this.mManager.requests(streamId);
        request.client.should.equal(client);
        request.stream.should.equal(ZERO_ADDRESS);
        request.approved.should.be.false;
        request.refund.should.false;
      });

      it("should not be able to request a stream with an ID that has been used before", async () => {
        // When the client requests a stream
        await this.mManager.requestStream(streamId, profiles, { from: client });

        // When a new request is made with the same id
        try {
          await this.mManager.requestStream(streamId, profiles.slice(1), {
            from: client,
          });
          assert.fail();
        } catch (e) {
          // Then the request will fail
          ensuresException(e);
        }
      });

      it("publisher should be able to approve a stream", async () => {
        await this.mManager.addPublisher(publisher, { from: managerAcc });

        // Given that a client requested to create a stream
        await this.mManager.requestStream(streamId, profiles, { from: client });

        // When the manager approves the stream
        const res = await this.mManager.approveStreamCreation(streamId, {
          from: publisher,
        });

        // Then the StreamApproved is emited with correct params
        truffleAssert.eventEmitted(res, "StreamApproved", (ev) => {
          return ev.streamId.eq(streamId);
        });

        // And the request object has the correct params
        const request = await this.mManager.requests(streamId);
        request.client.should.equal(client);
        request.stream.should.equal(ZERO_ADDRESS);
        request.approved.should.be.true;
        request.refund.should.false;
      });

      it("should be able to create a stream", async () => {
        const value = 100;

        // Given that we request and approve a stream
        await this.mManager.requestStream(streamId, profiles, { from: client });
        await this.mManager.approveStreamCreation(streamId, {
          from: managerAcc,
        });

        // When we create it
        const res = await this.mManager.createStream(streamId, {
          from: client,
          value,
        });
        const streamAddr = res.receipt.logs[0].args.streamAddress;

        // Then it should emit the required events
        truffleAssert.eventEmitted(res, "StreamCreated", (ev) => {
          return ev.streamId.eq(streamId) && ev.streamAddress == streamAddr;
        });

        // truffleAssert.eventEmitted(res, 'Deposited', (ev) => {
        //   return ev.amount.eq(new BN(value));
        // }); // event not caught in logs!?

        // And the manager should have the correct data about the stream
        const request = await this.mManager.requests(streamId);
        request.client.should.equal(client);
        request.stream.should.equal(streamAddr);
        request.approved.should.be.true;
        request.refund.should.false;

        // And the stream should have the correct owner
        this.mStream = await stream.at(streamAddr);
        const owner = await this.mStream.manager();
        owner.should.be.equal(this.mManager.address);

        // And the right chunks
        const inChunks = await this.mStream.getInChunks();
        inChunks.length.should.be.equal(0);

        // And the client funds should be escrowed
        const funds = new BN(await web3.eth.getBalance(this.mStream.address));
        funds.eq(new BN(value)).should.be.true;

        // And the stream balance should be correct
        const balance = new BN(await web3.eth.getBalance(this.mStream.address));
        balance.eq(new BN(value)).should.be.true;
      });

      it("should be not be able to create a stream with the same id", async () => {
        // When a stream was created
        const value = 100;
        await this.mManager.requestStream(streamId, profiles, { from: client });
        await this.mManager.approveStreamCreation(streamId, {
          from: managerAcc,
        });

        const res = await this.mManager.createStream(streamId, {
          from: client,
          value,
        });
        const streamAddr = res.receipt.logs[0].args.streamAddress;

        truffleAssert.eventEmitted(res, "StreamCreated", (ev) => {
          return ev.streamId.eq(streamId) && ev.streamAddress == streamAddr;
        });

        // When a createStream is called again for the same stream id
        try {
          await this.mManager.createStream(streamId, { from: client, value });
          assert.fail();
        } catch (e) {
          // Then the call will fail
          ensuresException(e);
        }
      });
    });

    describe("test Stream contract features for single profile", () => {
      const profiles = ["profile1", "profile2", "profile3"];
      const wattages = wattagesArr.slice(0, profiles.length);
      const profile = web3.utils.keccak256(profiles[0]);

      beforeEach("create stream", async () => {
        const value = new BN("10").pow(new BN("19")); // 10 VID
        const chunks = [new BN(1), new BN(2), new BN(3)];

        await this.mManager.addValidator(validator, { from: managerAcc });

        await this.mManager.requestStream(streamId, profiles, { from: client });
        await this.mManager.approveStreamCreation(streamId, {
          from: managerAcc,
        });

        const res = await this.mManager.createStream(streamId, {
          from: client,
          value,
        });

        const streamAddr = res.receipt.logs[0].args.streamAddress;
        this.mStream = await stream.at(streamAddr);

        await this.mManager.addPublisher(publisher, { from: managerAcc });

        await this.mManager.addInputChunkId(streamId, chunks[0], wattages, {
          from: publisher,
        });
        await this.mManager.addInputChunkId(streamId, chunks[1], wattages, {
          from: publisher,
        });
      });

      it("should be able to query version", async () => {
        // Given we have stream deployed
        // When querying the contracts` versions
        const manVer = await this.mManager.getVersion();
        const streamVer = await this.mStream.getVersion();

        // Then the versions should be string
        manVer.should.be.a("string");
        streamVer.should.be.a("string");

        // Then the versions should be the same
        manVer.should.have.have.lengthOf(streamVer.length);
        manVer.should.have.string(streamVer);
        manVer.should.be.equal(streamVer);

        // Then the versions should be formated as semver
        semverRegex().test(manVer).should.be.true;
      });

      it("should allow manager to add new input chunk ids after contract is deployed", async () => {
        const newChunkId = new BN(1000);
        // Given we have stream deployed
        // When the manager adds a new chunk id
        let res = await this.mManager.addInputChunkId(
          streamId,
          newChunkId,
          wattages,
          { from: managerAcc }
        );

        // Then we can query the new chunk
        const added = await this.mStream.isChunk(newChunkId);
        added.should.be.true;

        // And the InputChunkAdded event is emitted with the correct params
        truffleAssert.eventEmitted(res, "InputChunkAdded", (ev) => {
          return ev.chunkId.eq(new BN(newChunkId)) && ev.streamId.eq(streamId);
        });
      });

      it("should not be able to call addInputChunkId with the same id as before", async () => {
        // Given we have add a chunk id
        const newChunkId = new BN(1000);
        await this.mManager.addInputChunkId(streamId, newChunkId, wattages, {
          from: managerAcc,
        });

        // When the manager adds the same chunk id
        try {
          await this.mManager.addInputChunkId(streamId, newChunkId, wattages, {
            from: malicious,
          });
          assert.fail();
        } catch (e) {
          // Then we will get a revert
          ensuresException(e);
        }
      });

      it("should allow client to signal stream end", async () => {
        // Given that we have a stream contract
        // When the manager ends the stream
        const res = await this.mManager.endStream(streamId, { from: client });

        // Then the contracts` state changed accordingly
        const ended = await this.mStream.ended();
        ended.should.be.true;
        const request = await this.mManager.requests(streamId);
        request.ended.should.be.true;

        // And the InputChunkAdded event is emitted with the correct params
        truffleAssert.eventEmitted(res, "StreamEnded", (ev) => {
          return ev.caller == client;
        });
      });

      it("should allow manager to signal stream end", async () => {
        // Given that we have a stream contract
        // When the manager ends the stream
        const res = await this.mManager.endStream(streamId, {
          from: managerAcc,
        });

        // Then the contracts` state changed accordingly
        const ended = await this.mStream.ended();
        ended.should.be.true;
        const request = await this.mManager.requests(streamId);
        request.ended.should.be.true;

        // And the InputChunkAdded event is emitted with the correct params
        truffleAssert.eventEmitted(res, "StreamEnded", (ev) => {
          return ev.caller == managerAcc;
        });
      });

      it("should not allow new input chunk ids after stream has ended", async () => {
        // Given that we signaled a stream end
        await this.mManager.endStream(streamId, { from: managerAcc });

        // When we try to add more input chunks
        try {
          const newChunkId = new BN(1000);
          await this.mManager.addInputChunkId(streamId, newChunkId, wattages, {
            from: malicious,
          });
          assert.fail();
        } catch (e) {
          // Then we will get a revert
          ensuresException(e);
        }
      });

      it("should reject new input chunk ids from addresses other than manager", async () => {
        const newChunkId = new BN(1000);

        // When a malicious address tries to add a new chunk id
        try {
          await this.mManager.addInputChunkId(streamId, newChunkId, wattages, {
            from: malicious,
          });
          assert.fail();
        } catch (e) {
          // Then the address is denied and the transactions are reversed
          ensuresException(e);
        }

        // And the chunk id does not show up in the stream
        const addded = await this.mStream.isChunk(newChunkId);
        addded.should.be.false;
      });

      it("should be able to submit a proof", async () => {
        const chunkId = 1,
          proof = 1,
          outChunkId = 1;
        // Given we have stream deployed
        // When a miner first submits a proof
        const res = await this.mStream.submitProof(
          profile,
          chunkId,
          proof,
          outChunkId,
          { from: miner }
        );

        // Then the proof should show up as not validated
        const valid = await this.mStream.hasValidProof(profile, chunkId);
        valid.should.be.false;

        // And the miner data should be correct
        const proofIdx = res.receipt.logs[0].args.idx;
        const proofObj = await this.mStream.getProof(
          profile,
          chunkId,
          proofIdx
        );
        proofObj.miner.should.be.equal(miner);
        proofObj.proof.eq(new BN(proof)).should.be.true;
        proofObj.outputChunkId.eq(new BN(outChunkId)).should.be.true;

        // And the ChunkProofSubmited should be emited
        truffleAssert.eventEmitted(res, "ChunkProofSubmited", (ev) => {
          return (
            ev.chunkId.eq(new BN(chunkId)) &&
            ev.profile.toString("hex") == profile.slice(2) &&
            ev.idx.eq(new BN(0))
          );
        });
      });

      it("should be able to submit multiple proofs for same chunk", async () => {
        let chunkId = 1,
          proof = 1,
          outChunkId = 1;

        // Given that we have a stream
        // When we submit two proofs for the same profile&chunk
        let res = await this.mStream.submitProof(
          profile,
          chunkId,
          proof,
          outChunkId,
          { from: miner }
        );

        (chunkId = 1), (proof = 2), (outChunkId = 2);
        res = await this.mStream.submitProof(
          profile,
          chunkId,
          proof,
          outChunkId,
          { from: miner }
        );

        // Then the ChunkProofSubmited event is emitted with the right params
        truffleAssert.eventEmitted(res, "ChunkProofSubmited", (ev) => {
          return (
            ev.chunkId.eq(new BN(chunkId)) &&
            ev.profile.toString("hex") == profile.slice(2) &&
            ev.idx.eq(new BN(1))
          );
        });

        // And the proof count is correct
        const count = await this.mStream.getProofCount(profile, chunkId);
        count.eq(new BN(2)).should.be.true;
      });

      it("should be able to submit proofs for different chunks", async () => {
        let chunkId = 1,
          proof = 1,
          outChunkId = 1;

        // Given that we have a stream & that a proof was submited for a certain profile & chunk
        let res = await this.mStream.submitProof(
          profile,
          chunkId,
          proof,
          outChunkId,
          { from: miner }
        );

        // When we submit a proof for the same profile but a different chunk
        (chunkId = 2), (proof = 2), (outChunkId = 2);
        res = await this.mStream.submitProof(
          profile,
          chunkId,
          proof,
          outChunkId,
          { from: miner }
        );

        // Then the ChunkProofSubmited event is emitted with correct params
        truffleAssert.eventEmitted(res, "ChunkProofSubmited", (ev) => {
          return (
            ev.chunkId.eq(new BN(chunkId)) &&
            ev.profile.toString("hex") == profile.slice(2) &&
            ev.idx.eq(new BN(0))
          );
        });
      });

      it("should be able to get any proof", async () => {
        const chunkId = 1,
          proof = 1,
          outChunkId = 1,
          proof2 = 2,
          outChunkId2 = 2;

        // Given a chunk/profile has more proofs and we listened for the ChunkProofSubmited events
        let res1 = await this.mStream.submitProof(
          profile,
          chunkId,
          proof,
          outChunkId,
          { from: miner }
        );
        let res2 = await this.mStream.submitProof(
          profile,
          chunkId,
          proof2,
          outChunkId2,
          { from: miner }
        );

        // When a user wants to query the proofs
        const idx1 = res1.logs[0].args.idx;
        const idx2 = res2.logs[0].args.idx;
        const proofObj1 = await this.mStream.getProof(profile, chunkId, idx1);
        const proofObj2 = await this.mStream.getProof(profile, chunkId, idx2);

        // Then he will be able to do so and get the right results
        proofObj1.outputChunkId.eq(new BN(outChunkId)).should.be.true;
        proofObj1.proof.eq(new BN(proof)).should.be.true;

        proofObj2.outputChunkId.eq(new BN(outChunkId2)).should.be.true;
        proofObj2.proof.eq(new BN(proof2)).should.be.true;
      });

      it("should be able to get the candidate proof", async () => {
        const chunkId = 1,
          proof = 1,
          outChunkId = 1;

        // Given that a miner submits a proof
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });

        // When the miner queries the proof for validation
        const proofObj = await this.mStream.getCandidateProof(profile, chunkId);

        // Then he gets the right result
        proofObj.miner.should.equal(miner);
        proofObj.outputChunkId.eq(new BN(outChunkId)).should.be.true;
        proofObj.proof.eq(new BN(proof)).should.be.true;
      });

      it("should be able to validate a proof", async () => {
        const chunkId = 1,
          proof = 1,
          outChunkId = 1;

        // Given that a miner submits a proof
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });

        // When it gets validated
        const res = await this.mStream.validateProof(profile, chunkId, {
          from: validator,
        });

        // Then it should have a valid proof
        (await this.mStream.hasValidProof(profile, chunkId)).should.be.true;

        const valid = await this.mStream.getValidProof(profile, chunkId);
        valid.miner.should.be.equal(miner);
        valid.miner.should.be.equal(miner);
        valid.outputChunkId.eq(new BN(chunkId)).should.be.true;
        valid.proof.eq(new BN(proof)).should.be.true;

        // And emit the ChunkProofValidated event
        truffleAssert.eventEmitted(res, "ChunkProofValidated", (ev) => {
          return (
            ev.chunkId.eq(new BN(chunkId)) &&
            ev.profile.toString("hex") == profile.slice(2)
          );
        });
      });

      it("should reject validation if no proof exists", async () => {
        const chunkId = 1,
          proof = 1,
          outChunkId = 1;
        // Given that we have a stream
        try {
          // When a validator tries to validate a proof that does not exist (profile, chunkId)
          await this.mStream.validateProof(profile, chunkId, {
            from: validator,
          });
          assert.fail();
        } catch (e) {
          // Then operation is denied & the transaction is reversed
          ensuresException(e);
        }
      });

      it("should reject validation if no proof exists 2 - it was scrapped", async () => {
        const chunkId = 1,
          proof = 1,
          outChunkId = 1;
        // Given that we have a stream and a proof was submited and then scrapped such that no
        // proof exists for that chunk anymore
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });
        await this.mStream.scrapProof(profile, chunkId, { from: validator });

        try {
          // When a validator tries to validate the scrapped proof
          await this.mStream.validateProof(profile, chunkId, {
            from: validator,
          });
          assert.fail();
        } catch (e) {
          // Then operation is denied & the transaction is reversed
          ensuresException(e);
        }
      });

      it("should reject validation if chunk already validated", async () => {
        // Given that a miner submits a proof and it got validated
        const chunkId = 1,
          proof = 1,
          outChunkId = 1;
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });
        await this.mStream.validateProof(profile, chunkId, { from: validator });

        // When a validator tries to validate that proof again
        try {
          await this.mStream.validateProof(profile, chunkId, {
            from: validator,
          });
          assert.fail();
        } catch (e) {
          // Then transaction is reversed
          ensuresException(e);
        }
      });

      it("should be able to scrap a proof", async () => {
        const chunkId = 1,
          proof = 1,
          outChunkId = 1;

        // Given a miner submited a proof
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });

        // When a validator scrap a proof
        const res = await this.mStream.scrapProof(profile, chunkId, {
          from: validator,
        });

        // Then the ChunkProofScrapped is submited
        truffleAssert.eventEmitted(res, "ChunkProofScrapped", (ev) => {
          return (
            ev.chunkId.eq(new BN(chunkId)) &&
            ev.profile.toString("hex") == profile.slice(2)
          );
        });

        // And we now have no canditate proof left
        const proofObj = await this.mStream.getCandidateProof(profile, chunkId);
        proofObj.miner.should.equal(ZERO_ADDRESS);
        proofObj.outputChunkId.eq(new BN(0)).should.be.true;
        proofObj.proof.eq(new BN(0)).should.be.true;
      });

      it("should be able to check if stream is ready", async () => {
        // Given that we have a stream (one chunk & one profile)
        const newProfiles = ["new profile"];
        const newChunks = [new BN(1)];

        const { stream, streamId } = await createNewStream(
          this.mManager,
          client,
          managerAcc,
          newProfiles,
          newChunks
        );
        this.mStream = stream;
        // When we provide proofs for all the chunks & profiles, i.e. fully transcode the stream
        const chunkId = newChunks[0],
          proof = 1,
          outChunkId = 1;
        const profile = web3.utils.keccak256(newProfiles[0]);
        await this.mManager.addInputChunkId(streamId, chunkId, [wattage], {
          from: managerAcc,
        });
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });
        await this.mStream.validateProof(profile, chunkId, { from: validator });

        // Then the stream shows up as 'ready'
        const transcoded = await this.mStream.isTranscodingDone();
        transcoded.should.be.true;
      });
    });

    describe("test Stream contract features for multiple profiles", () => {
      const profiles = ["profile1", "profile2", "profile3"];
      const wattages = wattagesArr.slice(0, profiles.length);
      let profile = web3.utils.keccak256(profiles[0]);
      const chunks = [new BN(1), new BN(2)];

      beforeEach("create stream", async () => {
        const value = new BN("10").pow(new BN("19")); // 10 VID

        await this.mManager.addValidator(validator, { from: managerAcc });

        await this.mManager.requestStream(streamId, profiles, { from: client });
        await this.mManager.approveStreamCreation(streamId, {
          from: managerAcc,
        });

        const res = await this.mManager.createStream(streamId, {
          from: client,
          value,
        });

        const streamAddr = res.receipt.logs[0].args.streamAddress;
        this.mStream = await stream.at(streamAddr);

        await this.mManager.addInputChunkId(streamId, chunks[0], wattages, {
          from: managerAcc,
        });
        await this.mManager.addInputChunkId(streamId, chunks[1], wattages, {
          from: managerAcc,
        });
      });

      it("should be able to submit proofs for different profiles", async () => {
        const chunkId = chunks[0],
          proof = 1,
          outChunkId = 1;

        // When a miner submits two proofs for two different profiles
        let res = await this.mStream.submitProof(
          profile,
          chunkId,
          proof,
          outChunkId,
          { from: miner }
        );

        profile = web3.utils.keccak256(profiles[1]);
        res = await this.mStream.submitProof(
          profile,
          chunkId,
          proof,
          outChunkId,
          { from: miner }
        );

        // Then the proof for the second profile has the correct data
        const proofIdx = res.receipt.logs[0].args.idx;

        const proofObj = await this.mStream.getProof(
          profile,
          chunkId,
          proofIdx
        );
        proofObj.miner.should.be.equal(miner);
        proofObj.proof.eq(new BN(proof)).should.be.true;
        proofObj.outputChunkId.eq(new BN(outChunkId)).should.be.true;

        // And the ChunkProofSubmited event is emitted
        truffleAssert.eventEmitted(res, "ChunkProofSubmited", (ev) => {
          return (
            ev.chunkId.eq(new BN(chunkId)) &&
            ev.profile.toString("hex") == profile.slice(2) &&
            ev.idx.eq(new BN(0))
          );
        });
      });

      it("should return the correct number of profiles", async () => {
        // Given that we created a stream
        // When querying the number of profiles registered
        const count = await this.mStream.getProfileCount();

        // Then the count should be equal to the requested number
        count.eq(new BN(profiles.length)).should.be.true;
      });

      it("should correctly return output chunk ids for given profile if done", async () => {
        const proof = 1,
          outChunkId = 1;

        // Given that we submited all the proofs for a given profile
        await this.mStream.submitProof(profile, 1, proof, outChunkId, {
          from: miner,
        });
        await this.mStream.submitProof(profile, 2, proof, outChunkId, {
          from: miner,
        });

        // When we validate them all
        await this.mStream.validateProof(profile, 1, { from: validator });
        await this.mStream.validateProof(profile, 2, { from: validator });

        // Then the stream shows up ready for that profile
        const isTranscoded = await this.mStream.isProfileTranscoded(profile);
        isTranscoded.should.be.true;

        // And we can get the correct output chunk id list
        const outChunks = await this.mStream.getOutChunks(profile);
        outChunks.length.should.be.equal(chunks.length);
      });
    });

    describe("test Stream payment features", () => {
      const profiles = ["profile1", "profile2", "profile3"];
      const wattages = wattagesArr.slice(0, profiles.length);
      const chunks = [new BN(1), new BN(2), new BN(3)];
      const chunkId = 1,
        proof = 1,
        outChunkId = 1;
      const profile = web3.utils.keccak256(profiles[0]);

      beforeEach("create stream", async () => {
        const value = new BN("10").pow(new BN("16")); // funding tream with just 0.01 VID

        await this.mManager.requestStream(streamId, profiles, { from: client });
        await this.mManager.approveStreamCreation(streamId, {
          from: managerAcc,
        });

        const res = await this.mManager.createStream(streamId, {
          from: client,
          value,
        });
        await this.mManager.addValidator(validator, { from: managerAcc });
        await this.mManager.addInputChunkId(streamId, chunkId, wattages, {
          from: managerAcc,
        });

        const streamAddr = res.receipt.logs[0].args.streamAddress;
        this.mStream = await stream.at(streamAddr);
      });

      it("should be able to allocate funds to miner", async () => {
        // Given a miner submited a proof
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });
        const prevBalance = new BN(await web3.eth.getBalance(miner));

        // When the proof is validated
        const res = await this.mStream.validateProof(profile, chunkId, {
          from: validator,
        });

        // Then the miner`s new balance whould reflect the wattage/reward
        const balance = new BN(await web3.eth.getBalance(miner));
        wattage.eq(balance.sub(prevBalance)).should.be.true;

        // And the remaining balance allocated for the minet should be 0
        const remaining = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );
        remaining.eq(new BN(0)).should.be.true;

        // And the AccountFunded event is emitted with correct params
        truffleAssert.eventEmitted(res, "AccountFunded", (ev) => {
          return ev.weiAmount.eq(wattage) && ev.account == miner;
        });
      });

      it("should substract funds from stream contract when paying wattage reward", async () => {
        // Given a miner submited a proof
        const initStreamBalance = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });

        // When the proof is validated
        await this.mStream.validateProof(profile, chunkId, { from: validator });

        // The stream/escrow balance whould be subtracted accordingly
        const streamBalance = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );
        initStreamBalance.sub(streamBalance).eq(wattage).should.be.true;
      });

      it("should allow refund when called by manager", async () => {
        // Given that we have a stream
        const streamId = await this.mStream.id();

        // When we allow a refund for it
        const res = await this.mManager.allowRefund(streamId);

        // Then the stream/request shows up as refundable
        let allowed = await this.mManager.refundAllowed(streamId);
        allowed.should.be.true;

        // And the RefundAllowed event is emitted with the correct params
        truffleAssert.eventEmitted(res, "RefundAllowed", (ev) => {
          return ev.streamId.eq(streamId);
        });
      });

      it("should refund client if allowed by manager", async () => {
        // Given that we allowed a refund for the stream
        const streamId = await this.mStream.id();
        await this.mManager.allowRefund(streamId);

        const prevBalance = new BN(await web3.eth.getBalance(client));
        let streamBalance = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );

        // When the client calls refund
        let res = await this.mStream.refund();

        // Then the new client balance is added the refund amount
        const balance = new BN(await web3.eth.getBalance(client));
        balance.eq(prevBalance.add(streamBalance)).should.be.true;

        // And the stream balance should be empty
        streamBalance = new BN(await web3.eth.getBalance(this.mStream.address));
        streamBalance.eq(new BN(0)).should.be.true;

        // And the AccountFunded event is emitted with correct params
        truffleAssert.eventEmitted(res, "Refunded", (ev) => {
          return balance.eq(prevBalance.add(ev.weiAmount));
        });
      });

      it("should refund client if stream is done", async () => {
        // Given that we have a stream (one chunk & one profile)
        const newProfiles = ["new profile"];
        const wattages = wattagesArr.slice(0, newProfiles.length);
        const newChunks = [new BN(1)];
        let { stream, streamId } = await createNewStream(
          this.mManager,
          client,
          managerAcc,
          newProfiles,
          newChunks
        );
        this.mStream = stream;

        // When we provide proofs for all the chunks & profiles, i.e. fully transcode the stream
        // and the stream has ended
        const chunkId = newChunks[0],
          proof = 1,
          outChunkId = 1;
        await this.mManager.addInputChunkId(streamId, chunkId, wattages, {
          from: managerAcc,
        });
        const profile = web3.utils.keccak256(newProfiles[0]);
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });
        await this.mStream.validateProof(profile, chunkId, { from: validator });

        streamId = await this.mStream.id();
        await this.mManager.endStream(streamId, { from: client });

        // Then the client is allowed to get the refund
        const refundAllowed = await this.mStream.refundAllowed();
        refundAllowed.should.be.true;
      });

      it("should not be able to refund a client if not allowed by manager or stream not done", async () => {
        // Given that we have a fresh stream (refund not allowed)
        try {
          // When we try to refund it
          await this.mStream.refund();
          assert.fail();
        } catch (e) {
          // The operation is denied and the transaction is reversed
          ensuresException(e);
        }
      });

      it("should be able revoke a previously allowed refund", async () => {
        // Given that we have allowed a refund
        const streamId = await this.mStream.id();
        await this.mManager.allowRefund(streamId);

        // When we revoke refundunding
        const res = await this.mManager.revokeRefund(streamId);

        // Then the RefundRevoked event is emitted with the correct params
        truffleAssert.eventEmitted(res, "RefundRevoked", (ev) => {
          return ev.streamId.eq(streamId);
        });

        // And the request doesnt show up as refundable
        allowed = await this.mManager.refundAllowed(streamId);
        allowed.should.be.false;

        // And we can can`t call refund
        try {
          await this.mStream.refund();
          assert.fail();
        } catch (e) {
          ensuresException(e);
        }
      });

      it("should be able to fund stream", async () => {
        // Given that we have a stream
        const value = new BN(100);
        const prevBalance = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );

        // When we want to fund it with extra coins for wattages rewards
        const res = await this.mStream.deposit({ from: anyone, value });

        // Then the Deposited event is emitted with the correct params
        truffleAssert.eventEmitted(res, "Deposited", (ev) => {
          return ev.weiAmount.eq(value);
        });

        // And it`s balance shows the new deposit
        const balance = new BN(await web3.eth.getBalance(this.mStream.address));
        prevBalance.add(value).eq(balance).should.be.true;
      });

      it("should emit OutOfFunds event when necessary", async () => {
        // Given that we emptied the Stream account of funds (2 proofs, 1 validated)
        let chunk = chunks[0];

        await this.mStream.submitProof(profile, chunk, proof, outChunkId, {
          from: miner,
        });
        await this.mStream.validateProof(profile, chunk, { from: validator });

        chunk = chunks[1];
        await this.mManager.addInputChunkId(streamId, chunk, wattages, {
          from: managerAcc,
        });
        await this.mStream.submitProof(profile, chunk, proof, outChunkId, {
          from: miner,
        });

        // When trying to validate/reward a new proof
        let res = await this.mStream.validateProof(profile, chunk, {
          from: validator,
        });

        // Then the OutOfFunds event is emitted
        truffleAssert.eventEmitted(res, "OutOfFunds", (ev) => {
          return true;
        });
      });

      it("(bug) should not allow client to empty escrow if a proof he sent was validated", async () => {
        // Given that we have a stream contract deployed
        const value = new BN("10").pow(new BN("18")); // 1 VID

        const id = randInt();
        await this.mManager.requestStream(id, profiles, { from: client });
        await this.mManager.approveStreamCreation(id, { from: managerAcc });

        const res = await this.mManager.createStream(id, {
          from: client,
          value,
        });

        const streamAddr = res.receipt.logs[0].args.streamAddress;
        this.mStream = await stream.at(streamAddr);

        const prevBalance = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );

        // When the client that requested the stream provides a proof and the proof gets validated
        await this.mManager.addInputChunkId(id, chunkId, wattages, {
          from: managerAcc,
        });
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: client,
        });
        await this.mStream.validateProof(profile, chunkId, { from: validator });

        // Then the stream/escrow only awards the minning award and it`s not emptied (was a bug)
        const balance = new BN(await web3.eth.getBalance(this.mStream.address));
        balance.add(wattage).eq(prevBalance).should.be.true;
        balance.eq(new BN("0")).should.be.false;
      });
    });
    //========================================================================
    //========================================================================
    describe("test Stream payment features with publisher", () => {
      const profiles = ["profile1", "profile2", "profile3"];
      const wattages = wattagesArr.slice(0, profiles.length);
      const chunks = [new BN(1), new BN(2), new BN(3)];
      const chunkId = 1,
        proof = 1,
        outChunkId = 1;
      const profile = web3.utils.keccak256(profiles[0]);

      beforeEach("create stream", async () => {
        const value = new BN("10").pow(new BN("16")); // funding tream with just 0.01 VID
        await this.mManager.addPublisher(publisher, { from: managerAcc });
        await this.mManager.requestStream(streamId, profiles, { from: client });
        await this.mManager.approveStreamCreation(streamId, {
          from: publisher,
        });

        const res = await this.mManager.createStream(streamId, {
          from: client,
          value,
        });
        await this.mManager.addValidator(validator, { from: managerAcc });
        await this.mManager.addInputChunkId(streamId, chunkId, wattages, {
          from: publisher,
        });

        const streamAddr = res.receipt.logs[0].args.streamAddress;
        this.mStream = await stream.at(streamAddr);
      });

      it("should be able to allocate funds to miner", async () => {
        // Given a miner submited a proof
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });
        const prevBalance = new BN(await web3.eth.getBalance(miner));

        // When the proof is validated
        const res = await this.mStream.validateProof(profile, chunkId, {
          from: validator,
        });

        // Then the miner`s new balance whould reflect the wattage/reward
        const balance = new BN(await web3.eth.getBalance(miner));
        wattage.eq(balance.sub(prevBalance)).should.be.true;

        // And the remaining balance allocated for the minet should be 0
        const remaining = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );
        remaining.eq(new BN(0)).should.be.true;

        // And the AccountFunded event is emitted with correct params
        truffleAssert.eventEmitted(res, "AccountFunded", (ev) => {
          return ev.weiAmount.eq(wattage) && ev.account == miner;
        });
      });

      it("should substract funds from stream contract when paying wattage reward", async () => {
        // Given a miner submited a proof
        const initStreamBalance = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });

        // When the proof is validated
        await this.mStream.validateProof(profile, chunkId, { from: validator });

        // The stream/escrow balance whould be subtracted accordingly
        const streamBalance = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );
        initStreamBalance.sub(streamBalance).eq(wattage).should.be.true;
      });

      it("should allow refund when called by publisher", async () => {
        // Given that we have a stream
        const streamId = await this.mStream.id();

        // When we allow a refund for it
        const res = await this.mManager.allowRefund(streamId, {from: publisher});

        // Then the stream/request shows up as refundable
        let allowed = await this.mManager.refundAllowed(streamId);
        allowed.should.be.true;

        // And the RefundAllowed event is emitted with the correct params
        truffleAssert.eventEmitted(res, "RefundAllowed", (ev) => {
          return ev.streamId.eq(streamId);
        });
      });

      it("should refund client if allowed by publisher", async () => {
        // Given that we allowed a refund for the stream
        const streamId = await this.mStream.id();
        await this.mManager.allowRefund(streamId, {from: publisher});

        const prevBalance = new BN(await web3.eth.getBalance(client));
        let streamBalance = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );

        // When the client calls refund
        let res = await this.mStream.refund();

        // Then the new client balance is added the refund amount
        const balance = new BN(await web3.eth.getBalance(client));
        balance.eq(prevBalance.add(streamBalance)).should.be.true;

        // And the stream balance should be empty
        streamBalance = new BN(await web3.eth.getBalance(this.mStream.address));
        streamBalance.eq(new BN(0)).should.be.true;

        // And the AccountFunded event is emitted with correct params
        truffleAssert.eventEmitted(res, "Refunded", (ev) => {
          return balance.eq(prevBalance.add(ev.weiAmount));
        });
      });

      it("should refund client if stream is done", async () => {
        // Given that we have a stream (one chunk & one profile)
        const newProfiles = ["new profile"];
        const wattages = wattagesArr.slice(0, newProfiles.length);
        const newChunks = [new BN(1)];
        let { stream, streamId } = await createNewStream(
          this.mManager,
          client,
          publisher,
          newProfiles,
          newChunks
        );
        this.mStream = stream;

        // When we provide proofs for all the chunks & profiles, i.e. fully transcode the stream
        // and the stream has ended
        const chunkId = newChunks[0],
          proof = 1,
          outChunkId = 1;
        await this.mManager.addInputChunkId(streamId, chunkId, wattages, {
          from: publisher,
        });
        const profile = web3.utils.keccak256(newProfiles[0]);
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: miner,
        });
        await this.mStream.validateProof(profile, chunkId, { from: validator });

        streamId = await this.mStream.id();
        await this.mManager.endStream(streamId, { from: client });

        // Then the client is allowed to get the refund
        const refundAllowed = await this.mStream.refundAllowed();
        refundAllowed.should.be.true;
      });

      it("should not be able to refund a client if not allowed by manager or stream not done", async () => {
        // Given that we have a fresh stream (refund not allowed)
        try {
          // When we try to refund it
          await this.mStream.refund();
          assert.fail();
        } catch (e) {
          // The operation is denied and the transaction is reversed
          ensuresException(e);
        }
      });

      it("should be able revoke a previously allowed refund", async () => {
        // Given that we have allowed a refund
        const streamId = await this.mStream.id();
        await this.mManager.allowRefund(streamId);

        // When we revoke refundunding
        const res = await this.mManager.revokeRefund(streamId);

        // Then the RefundRevoked event is emitted with the correct params
        truffleAssert.eventEmitted(res, "RefundRevoked", (ev) => {
          return ev.streamId.eq(streamId);
        });

        // And the request doesnt show up as refundable
        allowed = await this.mManager.refundAllowed(streamId);
        allowed.should.be.false;

        // And we can can`t call refund
        try {
          await this.mStream.refund();
          assert.fail();
        } catch (e) {
          ensuresException(e);
        }
      });

      it("should be able to fund stream", async () => {
        // Given that we have a stream
        const value = new BN(100);
        const prevBalance = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );

        // When we want to fund it with extra coins for wattages rewards
        const res = await this.mStream.deposit({ from: anyone, value });

        // Then the Deposited event is emitted with the correct params
        truffleAssert.eventEmitted(res, "Deposited", (ev) => {
          return ev.weiAmount.eq(value);
        });

        // And it`s balance shows the new deposit
        const balance = new BN(await web3.eth.getBalance(this.mStream.address));
        prevBalance.add(value).eq(balance).should.be.true;
      });

      it("should emit OutOfFunds event when necessary", async () => {
        // Given that we emptied the Stream account of funds (2 proofs, 1 validated)
        let chunk = chunks[0];

        await this.mStream.submitProof(profile, chunk, proof, outChunkId, {
          from: miner,
        });
        await this.mStream.validateProof(profile, chunk, { from: validator });

        chunk = chunks[1];
        await this.mManager.addInputChunkId(streamId, chunk, wattages, {
          from: publisher,
        });
        await this.mStream.submitProof(profile, chunk, proof, outChunkId, {
          from: miner,
        });

        // When trying to validate/reward a new proof
        let res = await this.mStream.validateProof(profile, chunk, {
          from: validator,
        });

        // Then the OutOfFunds event is emitted
        truffleAssert.eventEmitted(res, "OutOfFunds", (ev) => {
          return true;
        });
      });

      it("(bug) should not allow client to empty escrow if a proof he sent was validated", async () => {
        // Given that we have a stream contract deployed
        const value = new BN("10").pow(new BN("18")); // 1 VID

        const id = randInt();
        await this.mManager.requestStream(id, profiles, { from: client });
        await this.mManager.approveStreamCreation(id, { from: publisher });

        const res = await this.mManager.createStream(id, {
          from: client,
          value,
        });

        const streamAddr = res.receipt.logs[0].args.streamAddress;
        this.mStream = await stream.at(streamAddr);

        const prevBalance = new BN(
          await web3.eth.getBalance(this.mStream.address)
        );

        // When the client that requested the stream provides a proof and the proof gets validated
        await this.mManager.addInputChunkId(id, chunkId, wattages, {
          from: publisher,
        });
        await this.mStream.submitProof(profile, chunkId, proof, outChunkId, {
          from: client,
        });
        await this.mStream.validateProof(profile, chunkId, { from: validator });

        // Then the stream/escrow only awards the minning award and it`s not emptied (was a bug)
        const balance = new BN(await web3.eth.getBalance(this.mStream.address));
        balance.add(wattage).eq(prevBalance).should.be.true;
        balance.eq(new BN("0")).should.be.false;
      });
    });
  }
);
