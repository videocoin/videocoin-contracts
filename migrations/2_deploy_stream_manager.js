var StreamManager = artifacts.require("StreamManager");

module.exports = function (deployer, network, accounts) {
  var from;
  if (network === 'everest') {
    // Key order is defined in everest provider
    from = accounts[0];
  } else {
    from = accounts[0];
  }

  console.log(`Deploying ${StreamManager.contractName} from ${from} on network: ${network}`);

  deployer.deploy(StreamManager, { from });

  console.log("Done");
};
