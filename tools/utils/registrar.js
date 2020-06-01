async function register(Contract, Registry) {
  const name = Contract.contractName;
  const address = Contract.address;
  const contract = await Contract.deployed();
  const abiString = JSON.stringify(contract.abi);
  const version = await contract.version();

  const registry = await Registry.deployed();

  console.log(`Making record for contract ${name} version ${version} in Registry(${registry.address})`);
  await registry.update(name, version, address, abiString);
}

module.exports = {
  register
}