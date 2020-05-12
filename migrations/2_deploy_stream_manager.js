const StreamManager = artifacts.require("StreamManager");

module.exports = async function (deployer, network, accounts) {
  var from;
  if (network === 'everest') {
    // Key order is defined in everest provider
    from = accounts[0];
  } else {
    from = accounts[0];
  }

  console.log(`Deploying ${StreamManager.contractName} from ${from} on network: ${network}`);

  await deployer.deploy(StreamManager, { from });
  const contract = await StreamManager.deployed();
  const owner = await contract.owner();

  console.log("Done");
};
