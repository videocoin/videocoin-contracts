const StakingEscrow = artifacts.require("StakingEscrow");

module.exports = async function (deployer, network, accounts) {
  const erc20 = process.env.ESCROW_ERC20_ADDRESS;
  const from = accounts[0];
  console.log(`Deploying ${StakingEscrow.contractName}. ERC20 ${erc20}. Owner ${from} on network: ${network}`);
  await deployer.deploy(StakingEscrow, erc20, { from });
  console.log("Done");
};
