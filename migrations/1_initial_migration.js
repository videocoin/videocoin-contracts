const Migrations = artifacts.require("Migrations");
const Registry = artifacts.require("Registry");

module.exports = async function(deployer) {
  await deployer.deploy(Migrations);
  await deployer.deploy(Registry);
};
