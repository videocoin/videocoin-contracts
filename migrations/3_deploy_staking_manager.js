const StakingManager = artifacts.require("StakingManager");
const Registry = artifacts.require("Registry");
const registrar = require('./registrar');

module.exports = async function (deployer, network, accounts) {
  var from;
  var minDelegation, minSelfStake;
  var approvalPeriod, unbondingPeriod;
  var slashRate, slashFund;
  if (network === 'everest') {
    // Key order is defined in everest provider
    from = accounts[1];

    const directStakeMinAmount = web3.utils.toWei("333333");
    const day = 60 * 60 * 24;
    const bondingPeriod = 10 * day;
    const unbondingPeriod = 21 * day;
    const delegatedStake = web3.utils.toWei("1");

    minDelegation = delegatedStake;
    minSelfStake = directStakeMinAmount;
    approvalPeriod = bondingPeriod;
    unbondingPeriod = unbondingPeriod;
    slashRate = 0;
    slashFund = "0x0000000000000000000000000000000000000000";
  } else {
    from = accounts[0];

    const sixvids = web3.utils.toWei("6");
    const tenvids = web3.utils.toWei("10");

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
