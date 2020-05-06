# VideoCoin Smart Contracts

This repo contains ethereum based smart contracts for VideoCoin blockchain.

## Prerequisits

* NodeJS v10

* Truffle Suite

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

## Deploying contracts

### Local environment

To deploy contracts on local environment first, in a new terminal run:

```$(bash)
make node
```

Now, run deployment command:

```$(bash)
truffle migrate
```

### Everest environment

TODO

## Code coverage

To run code coverage in terminal run:

```$(bash)
truffle run coverage
```

*Note*: Some tests may fail durring coverage run due to high gas consumption. We might need to exclude those from coverage run.
