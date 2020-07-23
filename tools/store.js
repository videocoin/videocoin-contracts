const firebase = require("firebase/app");
require("firebase/firestore");
require("firebase/auth");

function initializeApp() {
  const app = firebase.initializeApp(JSON.parse(process.env.FIRESTORE_CONFIG));

  return app;
}

async function storeContractData(contract, from, network) {
  if (
    !process.env.NETWORK ||
    !process.env.TAG ||
    !process.env.FIRESTORE_CONFIG
  ) {
    console.log("Environment variables are not set, nothing to store");
    return;
  }
  const app = initializeApp();
  await app.auth().signInAnonymously();

  const store = firebase.firestore();

  const name = contract.contractName;
  const address = contract.address;
  const abi = JSON.stringify(contract.abi);

  const data = {
    network: process.env.NETWORK || network,
    tag: process.env.TAG || "dev",
    name,
    address,
    deployer: from,
    abi,
    deployTime: firebase.firestore.FieldValue.serverTimestamp(),
  };

  await store
    .collection("contracts")
    .doc(
      `${process.env.NETWORK || network}#${name}#${
        process.env.TAG.replace("/", "@") || "dev"
      }`
    )
    .set(data);

  await store.waitForPendingWrites();
  await store.terminate();
  await store.clearPersistence();

  await app.auth().signOut();
  await app.delete();
}

module.exports = storeContractData;
