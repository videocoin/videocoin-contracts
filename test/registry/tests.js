const PaymentManager = artifacts.require("./PaymentManager.sol");
const Registry = artifacts.require("./Registry.sol");

const truffleAssert = require("truffle-assertions");
const BN = web3.utils.BN;
require("chai")
  .use(require("chai-as-promised"))
  .use(require('chai-bn')(BN))
  .should();

const { ZERO_ADDRESS, register } = require("../../tools/utils");

contract("registry", ([registryAcc, managerAcc]) => {
  beforeEach("initialize contract", async () => {
    this.manager = await PaymentManager.new({ from: managerAcc });
    this.registry  = await Registry.new({from: registryAcc });
  });

  describe("test registry contract", () => {

    it("should be deployed correctly", async () => {
      assert.notEqual(this.registry, null, "registry not deployed");
    });

    it("should have the deployer account returned as owner", async () => {
      registryAcc.should.be.equal(await this.registry.owner());
    });

    it("should be able to add new record", async () => {
      const version = await this.manager.version();
      const owner = await this.manager.owner();
      const name = "Payments";
      const address = this.manager.address;
      const res = await this.registry.update(name, version, owner, address);

      // Then it should emit the required events
      truffleAssert.eventEmitted(res, "RecordAdded", (ev) => {
        return ev.name == web3.utils.sha3(name) && ev.version == web3.utils.sha3(version)
      });
    });

    it("should be able to update existing record", async () => {
      var version = await this.manager.version();
      const owner = await this.manager.owner();
      const name = "Payments";
      const address = this.manager.address;
      const res = await this.registry.update(name, version, owner, address);

      version = 'dummy 9.0.0';

      // Then it should emit the required event
      truffleAssert.eventEmitted(res, "RecordUpdated", (ev) => {
        return ev.name == name && ev.version == version;
      });
    });

    
  });
});
