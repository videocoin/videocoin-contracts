const StakingManager = artifacts.require("StakingManager");
const Registry = artifacts.require("Registry");
const registrar = require('./registrar');

module.exports = async function (deployer, network, accounts) {
  const twovids = web3.utils.toWei("2");
  const sixvids = web3.utils.toWei("6");
  const tenvids = web3.utils.toWei("10");

  var from;
  var minDelegation, minSelfStake;
  var approvalPeriod, unbondingPeriod;
  var slashRate, slashFund;
  if (network === 'everest') {
    // Key order is defined in everest provider
    from = accounts[1];

    minDelegation = twovids;
    minSelfStake = tenvids;
    approvalPeriod = 100;
    unbondingPeriod = 100;
    slashRate = 0;
    slashFund = "0x0000000000000000000000000000000000000000";
  } else {
    from = accounts[0];

    minDelegation = sixvids;
    minSelfStake = tenvids;
    approvalPeriod = 5;
    unbondingPeriod = 10;
    slashRate = 50;
    slashFund = "0x0000000000000000000000000000000000000000";
  }

  console.log(`Deploying ${StakingManager.contractName} from ${from} on network: ${network}`);
  console.log(`required stake:      ${minSelfStake}`);
  console.log(`required delegation: ${minDelegation}`);
  console.log(`approval period:     ${approvalPeriod}`);
  console.log(`unbonding period:    ${unbondingPeriod}`);
  console.log(`slash rate:          ${slashRate}`);
  console.log(`slash fund account:  ${slashFund}`);

  await deployer.deploy(
    StakingManager,
    minDelegation,
    minSelfStake,
    approvalPeriod,
    unbondingPeriod,
    slashRate,
    slashFund,
    { from }
  );

  await registrar.register(StakingManager, Registry);

  console.log("Done");
};
