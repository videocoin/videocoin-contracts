var StakingManager = artifacts.require("StakingManager");

const sixvids = web3.utils.toWei("6");
const tenvids = web3.utils.toWei("10");

const minDelegation = sixvids;
const minSelfDelegation = tenvids;
const approvalPeriod = 5;
const unbondingPeriod = 10;
const slashRate = 50;
const slashFund = "0x0000000000000000000000000000000000000000";

module.exports = function (deployer, network, accounts) {
  const from = accounts[0];
  console.log(`Deploying StakingManager from ${from} on network: ${network}`);

  deployer.deploy(
    StakingManager,
    minDelegation,
    minSelfDelegation,
    approvalPeriod,
    unbondingPeriod,
    slashRate,
    slashFund,
    { from }
  );

  console.log("Done");
};
