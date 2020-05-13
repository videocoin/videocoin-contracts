const NativeBridge = artifacts.require("NativeBridge");
const NativeProxy = artifacts.require("NativeProxy");
const RemoteBridge = artifacts.require("RemoteBridge");
const Registry = artifacts.require("Registry");
const registrar = require('./registrar');

module.exports = async function(deployer, network, accounts) {
  var native, remote;
  if (network === 'everest') {
    // Key order is defined in everest provider
    native = accounts[3];
    remote = accounts[4];
  } else {
    native = remote = accounts[0];
  }

  console.log(`Deploying ${NativeBridge.contractName} from ${native} on network: ${network}`);
  await deployer.deploy(NativeBridge, { from: native });

  // NativeProxy doesn't require to have an owner. Reusing existing key
  console.log(`Deploying ${NativeProxy.contractName} from ${native} on network: ${network}`);
  await deployer.deploy(NativeProxy, { from: native });

  console.log(`Deploying ${RemoteBridge.contractName} from ${remote} on network: ${network}`);
  await deployer.deploy(RemoteBridge, { from: remote });

  await registrar.register(NativeBridge, Registry);
  await registrar.register(NativeProxy, Registry);
  await registrar.register(RemoteBridge, Registry);

  console.log('Done');
};