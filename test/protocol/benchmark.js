const stream = artifacts.require('./Stream.sol');
const streamManager = artifacts.require('./StreamManager.sol');

const logger = require('mocha-logger');
const BN = web3.utils.BN;
require('chai')
  .use(require('chai-as-promised'))
  .should();

const wattage = (new BN('10')).pow(new BN('16'));
const wattagesArr = Array(10).fill(wattage);


contract('stream', (
  [
    managerAcc,
    client,
    miner,
    validator,
  ]
) => {
  let streamId = new BN(1);

  beforeEach('initialize contracts', async () => {
    this.mManager = await streamManager.new({ from: managerAcc });
    this.mStream = null;
  });

  describe('benchmark smart contracts', () => {
    const chunks = [new BN(1), new BN(2), new BN(3)];
    const profiles = ['profile1', 'profile2', 'profile3'];
    const wattages = wattagesArr.slice(0, profiles.length);
    const profile = web3.utils.keccak256(profiles[0]);

    describe('manager deploy benchmark', () => {
      it('', async () => {
        const txhash = this.mManager.transactionHash;
        const receipt = await web3.eth.getTransactionReceipt(txhash);

        logger.log(`manager deployment gas: ${receipt.gasUsed}`);
      });
    })

    describe('stream deploy benchmark - lower bound', () => {
      it('', async () => {
        const value = 100;
        let totalGas = 0;
        let gas = 0;

        let res = await this.mManager.requestStream(streamId, profiles, { from: client });
        gas = res.receipt.gasUsed;
        logger.log(`requestStream: ${gas}`);
        totalGas += gas;
        
        res = await this.mManager.approveStreamCreation(streamId, { from: managerAcc });
        gas = res.receipt.gasUsed;
        logger.log(`approveStreamCreation: ${gas}`);
        totalGas += gas;

        res = await this.mManager.createStream(streamId, { from: client, value });
        gas = res.receipt.gasUsed;
        logger.log(`createStream: ${gas}`);
        totalGas += gas;

        logger.log(`stream deployment total gas: ${totalGas}`);
      });
    })

    describe('chunk processing benchmark - lower bound', () => {
      it('', async () => {
        let totalGas = 0;

        const value = (new BN('10')).pow(new BN('19')); // 10 VID
        const chunks = [new BN(1), new BN(2), new BN(3)];
        const chunkId = 1, proof = 1, outChunkId = 1;

        await this.mManager.addValidator(validator, { from: managerAcc });

        await this.mManager.requestStream(streamId, profiles, { from: client });
        await this.mManager.approveStreamCreation(streamId, { from: managerAcc });
        let res = await this.mManager.createStream(streamId, { from: client, value });
        const streamAddr = res.receipt.logs[0].args.streamAddress;
        this.mStream = await stream.at(streamAddr);

        let gas = 0;
        res = await this.mManager.addInputChunkId(streamId, chunks[0], wattages, { from: managerAcc });
        gas = res.receipt.gasUsed;
        logger.log(`addInputChunkId: ${gas}`);
        totalGas += gas;

        res = await this.mStream.submitProof(profile, chunkId, proof, outChunkId, { from: miner });
        gas = res.receipt.gasUsed;
        logger.log(`submitProof: ${gas}`);
        totalGas += gas;

        res = await this.mStream.validateProof(profile, chunkId, { from: validator });
        gas = res.receipt.gasUsed;
        logger.log(`validateProof: ${gas}`);
        totalGas += gas;

        logger.log(`chunk processing total gas: ${totalGas}`);
      });
    })
  });
});
