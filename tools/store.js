const firebase = require("firebase/app");
require("firebase/firestore");
require("firebase/auth");

function initializeApp() {
  const app = firebase.initializeApp(JSON.parse(process.env.FIRESTORE_CONFIG));
  // const app = firebase.initializeApp({
  //   apiKey: "AIzaSyAM8Xc4clY51WDrpehgv0BHjLC4VgNK-RQ",
  //   authDomain: "videocoin-firebase-dev.firebaseapp.com",
  //   databaseURL: "https://videocoin-firebase-dev.firebaseio.com",
  //   projectId: "videocoin-firebase-dev",
  //   storageBucket: "videocoin-firebase-dev.appspot.com",
  //   messagingSenderId: "152238303290",
  //   appId: "1:152238303290:web:adde0d84fb3afd41b16d03",
  //   measurementId: "G-FLDQ73Q6JG",
  // });

  return app;
}

async function storeContractData(contract, from, network) {
  if (
    !process.env.DEPLOYMENT_ENVIRONMENT ||
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
    environment: process.env.DEPLOYMENT_ENVIRONMENT || network,
    tag: process.env.TAG || "local",
    name,
    address,
    deployer: from,
    abi,
    deployTime: firebase.firestore.FieldValue.serverTimestamp(),
  };

  await store
    .collection("contracts")
    .doc(
      `${process.env.DEPLOYMENT_ENVIRONMENT || network}#${name}#${
        process.env.TAG.replace("/", "@") || "local"
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
