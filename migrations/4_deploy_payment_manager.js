const PaymentManager = artifacts.require("PaymentManager");

module.exports = async function (deployer, network, accounts) {
  var from;
  if (network === 'everest') {
    // Key order is defined in everest provider
    from = accounts[2];
  } else {
    from = accounts[0];
  }
  console.log(`Deploying ${PaymentManager.contractName} from ${from} on network: ${network}`);

  await deployer.deploy(PaymentManager, { from });

  console.log("Done");
};
