const BatchTransfer = artifacts.require("BatchTransfer");
const store = require("../tools/store");

module.exports = async function (deployer, network, accounts) {
  if (network === "everest") {
    console.log("Skip ${BatchTransfer.contractName} deployment");
  }

  const from = accounts[0];
  console.log(
    `Deploying ${BatchTransfer.contractName}. Owner ${from} on network: ${network}`
  );
  await deployer.deploy(BatchTransfer, { from });
  await store(BatchTransfer, from, network);
  console.log("Done");
};
