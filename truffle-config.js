const HDWalletProvider = require("@truffle/hdwallet-provider");
const Wallet = require("ethereumjs-wallet");


module.exports = {

  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545, 
      network_id: "*",
    },
    
    ci: {
      host: "127.0.0.1",
      port: 8545, 
      network_id: "*",
    },

    everestdev: {
      provider: function () {
        const fs = require("fs");
        var privateKeys;
        try {
          const priv = JSON.parse(
            fs.readFileSync("/vault/secrets/manager.priv")
          );
          const passphrase = fs.readFileSync(
            "/vault/secrets/manager.pass",
            "utf8"
          );
          const wallet = Wallet.fromV3(priv, passphrase.trim());
          privateKeys = [wallet.getPrivateKey().toString("hex")];
        } catch (err) {
          if (err.code === "ENOENT") {
            console.log("File not found!", err.toString());
          } else {
            throw err;
          }
        }

        return new HDWalletProvider(
          privateKeys,
          "http://symphony-geth-archiver.symphony.svc.cluster.local:8545"
        );
      },
      gas: 4000000,
      network_id: 87654,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.5.17", 
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 1,
        },
      },
    },
  },
};
