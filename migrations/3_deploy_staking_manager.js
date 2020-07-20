const StakingManager = artifacts.require("StakingManager");
const CASStaking = artifacts.require("CASStaking");
const store = require("../tools/store");

module.exports = async function (deployer, network, accounts) {
  var managerOwner, casOwner;
  var minDelegation, minSelfStake;
  var approvalPeriod, unbondingPeriod;
  var slashRate, slashFund;
  if (network === "everest") {
    // Key order is defined in everest provider
    managerOwner = accounts[1];

    const day = 60 * 60 * 24;
    const minute = 60;

    minDelegation = web3.utils.toWei("1");
    minSelfStake = web3.utils.toWei("50000");
    approvalPeriod = 5 * minute;
    unbondingPeriod = 21 * day;
    slashRate = 0;
    slashFund = "0x0000000000000000000000000000000000000000";
  } else {
    managerOwner = accounts[0];

    const tenvids = web3.utils.toWei("10");

    minDelegation = 1;
    minSelfStake = tenvids;
    approvalPeriod = 5;
    unbondingPeriod = 10;
    slashRate = 50;
    slashFund = "0x0000000000000000000000000000000000000000";
  }

  console.log(
    `Deploying ${StakingManager.contractName} from ${managerOwner} on network: ${network}`
  );
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
    { from: managerOwner }
  );
  await store(StakingManager, managerOwner, network);

  if (network === "everest") {
    casOwner = accounts[5];
  } else {
    casOwner = accounts[0];
  }

  await deployer.deploy(CASStaking, StakingManager.address, { from: casOwner });
  await store(CASStaking, casOwner, network);

  const staking = await StakingManager.deployed();
  console.log(`adding ${CASStaking.address} as manager to StakingManager`);
  await staking.addManager(CASStaking.address, { from: managerOwner });

  console.log("Done");
};
