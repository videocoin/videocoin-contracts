const StreamManager = artifacts.require("StreamManager");
const Registry = artifacts.require("Registry");
const registrar = require('../tools/utils/registrar');

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
  await registrar.register(StreamManager, Registry);

  console.log("Done");
};
