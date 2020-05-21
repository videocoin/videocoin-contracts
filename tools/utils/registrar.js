const { ZERO_ADDRESS } = require('.');

async function register(Contract, Registry) {
  const name = Contract.contractName;
  const address = Contract.address;
  const contract = await Contract.deployed();
  const version = await contract.version();
  const owner = contract.owner ? await contract.owner() : ZERO_ADDRESS;

  const registry = await Registry.deployed();

  console.log(`Making record for contract ${name} version ${version} in Registry(${registry.address})`);
  await registry.update(name, version, address, owner);
}

module.exports = {
  register
}