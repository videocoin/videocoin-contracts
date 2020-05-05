var StreamManager = artifacts.require("StreamManager");

module.exports = function (deployer, network, accounts) {
  var from;
  if (network === 'evereststage') {
    // Key order is defined in evereststage provider
    from = accounts[0];
  } else {
    from = accounts[0];
  }

  console.log(`Deploying StreamManager from ${from} on network: ${network}`);

  deployer.deploy(StreamManager, { from });

  console.log("Done");
};
