async function register(Contract, Registry, from) {
  const name = Contract.contractName;
  const address = Contract.address;
  const contract = await Contract.deployed();
  const version = await contract.version();

  const registry = await Registry.deployed();

  console.log(`Making record for contract ${name} version ${version} in Registry(${registry.address})`);
  await registry.update(name, version, address);
}

module.exports = {
  register
}