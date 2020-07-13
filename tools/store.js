const firebase = require("firebase/app");
require("firebase/firestore");
require("firebase/auth");

function initializeApp() {
  const app = firebase.initializeApp(JSON.parse(process.env.FIRESTORE_CONFIG));
  // const app = firebase.initializeApp({
  //   apiKey: "AIzaSyA7oip8HUVIW1EvvZLVUDixho0iK_Ln3qg",
  //   authDomain: "videocoin-firebase.firebaseapp.com",
  //   databaseURL: "https://videocoin-firebase.firebaseio.com",
  //   projectId: "videocoin-firebase",
  //   storageBucket: "videocoin-firebase.appspot.com",
  //   messagingSenderId: "1012727539280",
  //   appId: "1:1012727539280:web:76812108c27f4068cad355",
  //   measurementId: "G-W1FSRCDZDZ",
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
    .doc(process.env.DEPLOYMENT_ENVIRONMENT || network)
    .collection(name)
    .doc(process.env.TAG || "local")
    .set(data);

  await store.waitForPendingWrites();
  await store.terminate();
  await store.clearPersistence();

  await app.auth().signOut();
  await app.delete();
}

module.exports = storeContractData;
