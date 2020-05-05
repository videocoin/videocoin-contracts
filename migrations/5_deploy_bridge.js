const NativeBridge = artifacts.require("NativeBridge");
const NativeProxy = artifacts.require("NativeProxy");
const RemoteBridge = artifacts.require("RemoteBridge");

module.exports = function(deployer, network, accounts) {
  const from = accounts[0];

  console.log(`Deploying NativeBridge from ${from} on network: ${network}`);
  deployer.deploy(NativeBridge, { from });

  console.log(`Deploying NativeProxy from ${from} on network: ${network}`);
  deployer.deploy(NativeProxy, { from });

  console.log(`Deploying RemoteBridge from ${from} on network: ${network}`);
  deployer.deploy(RemoteBridge, { from });

  console.log('Done')
};