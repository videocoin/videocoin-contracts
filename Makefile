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

BINGEN_DOCKER=docker run \
	-v ${shell pwd}:/source \
	-v ${shell pwd}/build/bin:/build \
	--rm -ti ethereum/solc:${SOLC_VERSION}

CODEGEN_DOCKER=docker run \
	--user $(shell id -u):$(shell id -g) \
	-v $(shell pwd)/build/abi:/abi \
	-v $(shell pwd)/build/bin:/bin \
	-v $(shell pwd)/bindings:/bindings \
	--rm -ti ethereum/client-go:alltools-latest abigen

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
	mkdir -p build/abi/
	${ABIGEN_DOCKER} -o /build --abi --overwrite \
		--allow-paths /source openzeppelin-solidity=source/node_modules/openzeppelin-solidity \
		${contracts}

.PHONY: bin
bin:
	mkdir -p build/bin/
	${BINGEN_DOCKER} -o /build --bin --overwrite \
		--allow-paths /source openzeppelin-solidity=source/node_modules/openzeppelin-solidity \
		${contracts}

.PHONY: bindings
bindings:
	mkdir -p bindings/streams/
	${CODEGEN_DOCKER} --bin bin/StreamManager.bin --abi abi/StreamManager.abi --pkg streams --type StreamManager --out bindings/streams/manager.go
	${CODEGEN_DOCKER} --bin bin/Stream.bin --abi abi/Stream.abi --pkg streams --type Stream --out bindings/streams/stream.go
	mkdir -p bindings/staking/
	${CODEGEN_DOCKER} --bin bin/StakingManager.bin --abi abi/StakingManager.abi --pkg staking --type StakingManager --out bindings/staking/manager.go
	mkdir -p bindings/payments/
	${CODEGEN_DOCKER} --bin bin/PaymentManager.bin --abi abi/PaymentManager.abi --pkg payments --type PaymentManager --out bindings/payments/manager.go
	mkdir -p bindings/nativebridge
	${CODEGEN_DOCKER} --bin bin/NativeBridge.bin --abi abi/NativeBridge.abi --pkg nativebridge --type NativeBridge --out bindings/nativebridge/nativebridge.go
	mkdir -p bindings/nativeproxy
	${CODEGEN_DOCKER} --bin bin/NativeProxy.bin --abi abi/NativeProxy.abi --pkg nativeproxy --type NativeProxy --out bindings/nativeproxy/nativeproxy.go
	mkdir -p bindings/remotebridge
	${CODEGEN_DOCKER} --bin bin/RemoteBridge.bin --abi abi/RemoteBridge.abi --pkg remotebridge --type RemoteBridge --out bindings/remotebridge/remotebridge.go
	
	