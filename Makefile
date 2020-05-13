REGISTRY=registry.videocoin.net/contracts
VERSION?=dev
SOLC_VERSION?=0.5.13
GIT_TAG=$(shell git describe --exact-match --tags 2> /dev/null || git rev-parse --short HEAD)

GANACHE_DOCKER=docker run \
	-p 8545:8545 \
	--rm -ti trufflesuite/ganache-cli:v6.9.1 \
	--deterministic

ABIGEN_DOCKER=docker run \
	-v ${shell pwd}:/source \
	-v ${shell pwd}/build/abi:/build \
	--rm -ti ethereum/solc:${SOLC_VERSION}

files=${wildcard contracts/**/*.sol}
contracts=$(addprefix source/,${files})

.PHONY: images
images:
	docker build --build-arg tag=$(GIT_TAG) -t ${REGISTRY}/deployment:$(VERSION) .

.PHONY: push
push:
	docker push ${REGISTRY}/deployment:$(VERSION)

.PHONY: node
node:
	${GANACHE_DOCKER}

.PHONY: abi
abi:
	@echo ${contracts}
	mkdir -p build/abi/
	${ABIGEN_DOCKER} -o /build --abi --bin --overwrite \
		--allow-paths /source openzeppelin-solidity=source/node_modules/openzeppelin-solidity \
		${contracts}


