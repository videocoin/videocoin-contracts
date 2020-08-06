# VideoCoin Smart Contracts

![Build Status](https://drone.videocoin.net/api/badges/videocoin/videocoin-contracts/status.svg)

This repo contains ethereum based smart contracts for VideoCoin blockchain.

## Prerequisits

- NodeJS v10

- Docker

- Truffle Suite

To install truffle run:

```$(bash)
npm i -g truffle@5.1.24
```

## Building contracts

Install dependencies (from project folder):

```$(bash)
npm install
```

Compile contracts:

```$(bash)
truffle compile
```

## Running tests

In order to run the tests you always need the ganache-cli command running in a terminal. In a new terminal run:

```$(bash)
make node
```

Next, in a new terminal run:

```$(bash)
truffle test
```

## Deploying contracts using truffle scripts

### Local environment

To deploy contracts on local environment first, in a new terminal run:

```$(bash)
make node
```

Now, run deployment command:

```$(bash)
truffle migrate
```

## Deploying contracts using Docker image

**Note**: _Deployment using docker image allows to store contract information to contract registry._

To create docker image run following command:

```$(bash)
make image
```

### Deploy smart contracts

Define contract registry variable and run docker image:

```$(bash)
export NETWORK=vid-dev
export FIRESTORE_CONFIG=./firestore.json
OPTIONS='-e NETWORK -e FIRESTORE_CONFIG' make deploy
```

`NETWORK` variable should contain blockchain network name, i.e. ethereum, goerli, rinkeby, vid-dev, vid-stage, vid-prod, etc.

`make deploy` installs all contracts defined in `/migrations` directory.

### Deploy particular smart contract

Define contract registry variable and run docker image:

```$(bash)
export NETWORK=vid-dev
export FIRESTORE_CONFIG=./firestore.json
OPTIONS='-e NETWORK -e FIRESTORE_CONFIG' ARGS='-f 4 --to 4' make deploy
```

`ARGS` is used to pass command arguments to `truffle deploy` command.

`-f 4 --to 4` is translated as "deploy contracts starting **from** migration script with prefix **4** in `/migrations` directory **to** migration with prefix **4**"

## Code coverage

To run code coverage in terminal run:

```$(bash)
truffle run coverage
```

**Note**: _Some tests may fail durring coverage run due to high gas consumption. We might need to exclude those from coverage run._
