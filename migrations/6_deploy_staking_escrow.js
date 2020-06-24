const StakingEscrow = artifacts.require("StakingEscrow");
const TestERC = artifacts.require("TestERC");

module.exports = async function (deployer, network, accounts) {
  if (network === "everest") {
    console.log("Skip ${TestERC.contractName} deployment");
  }

  const from = accounts[0];
  var erc20 = process.env.ESCROW_ERC20_ADDRESS;
  if (network === "development" || network === "ci") {
     await deployer.deploy(TestERC, { from });
     erc20 = TestERC.address;
  }

  console.log(`Deploying ${StakingEscrow.contractName}. ERC20 ${erc20}. Owner ${from} on network: ${network}`);
  await deployer.deploy(StakingEscrow, erc20, { from });
  console.log("Done");
};
