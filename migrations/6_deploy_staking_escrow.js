const StakingEscrow = artifacts.require("StakingEscrow");
const TestERC = artifacts.require("TestERC");
const store = require("../tools/store");

module.exports = async function (deployer, network, accounts) {
  if (network === "everest") {
    console.log("Skip ${TestERC.contractName} deployment");
  }

  const from = accounts[0];
  var erc20 = process.env.ESCROW_ERC20_ADDRESS;
  if (network === "development" || network === "ci" || network === "goerli") {
    await deployer.deploy(TestERC, { from });
    await store(TestERC, from, network);
    erc20 = TestERC.address;
  }

  console.log(
    `Deploying ${StakingEscrow.contractName}. ERC20 ${erc20}. Owner ${from} on network: ${network}`
  );
  await deployer.deploy(StakingEscrow, erc20, { from });
  await store(StakingEscrow, from, network);
  console.log("Done");
};
