const NativeBridge = artifacts.require("NativeBridge");
const NativeProxy = artifacts.require("NativeProxy");
const RemoteBridge = artifacts.require("RemoteBridge");
const store = require("../tools/store");

module.exports = async function (deployer, network, accounts) {
  var native, remote;
  if (network === "everest") {
    // Key order is defined in everest provider
    native = accounts[3];
    remote = accounts[4];
  } else {
    native = remote = accounts[0];
  }

  console.log(
    `Deploying ${NativeBridge.contractName} from ${native} on network: ${network}`
  );
  await deployer.deploy(NativeBridge, { from: native });
  await store(NativeBridge, native, network);

  // NativeProxy doesn't require to have an owner. Reusing existing key
  console.log(
    `Deploying ${NativeProxy.contractName} from ${native} on network: ${network}`
  );
  await deployer.deploy(NativeProxy, { from: native });
  await store(NativeProxy, native, network);

  console.log(
    `Deploying ${RemoteBridge.contractName} from ${remote} on network: ${network}`
  );
  await deployer.deploy(RemoteBridge, { from: remote });
  await store(RemoteBridge, remote, network);

  console.log("Done");
};
