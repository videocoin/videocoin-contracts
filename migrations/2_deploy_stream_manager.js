var StreamManager = artifacts.require("StreamManager");

module.exports = function (deployer, network, accounts) {
  const from = accounts[0];
  console.log(`Deploying StreamManager from ${from} on network: ${network}`);

  deployer.deploy(StreamManager, { from });

  console.log("Done");
};
