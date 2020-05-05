const PaymentManager = artifacts.require("PaymentManager");

module.exports = function (deployer, network, accounts) {
  const from = accounts[0];
  console.log(`Deploying PaymentManager from ${from} on network: ${network}`);

  deployer.deploy(PaymentManager, { from });

  console.log("Done");
};
