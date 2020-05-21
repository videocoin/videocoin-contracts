const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const EVMError = message => `VM Exception while processing transaction: ${message}`;
const vidcoin = n => new web3.utils.BN(web3.utils.toWei(n, 'ether'));

function randInt() {
  return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
}

function isException(error) {
  let strError = error.toString();
  return (
    strError.includes("invalid opcode") ||
    strError.includes("invalid JUMP") ||
    strError.includes("revert")
  );
}

function ensuresException(error) {
  assert(isException(error), error.toString());
}

const mineBlock = () => (
  new Promise((resolve, reject) =>
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_mine',
      id: new Date().getTime(),
    }, (error, result) => (error ? reject(error) : resolve(result.result))))
);

const mineNBlocks = async (n) => {
  for (let i = 0; i < n; i += 1) {
    mineBlock();
  }
};

const addSeconds = seconds => (
  new Promise((resolve, reject) =>
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [seconds],
      id: new Date().getTime(),
    }, (error, result) => (error ? reject(error) : resolve(result.result))))
    .then(mineBlock)
);

const addDays = days => (
  addSeconds(86400 * days)
);

module.exports = {
  ZERO_ADDRESS,
  ZERO_BYTES32,
  EVMError,
  vidcoin,
  randInt,
  ensuresException,
  addDays, 
  addSeconds,
  mineBlock,
  mineNBlocks,
};
