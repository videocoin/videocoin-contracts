REGISTRY=registry.videocoin.net/contracts
VERSION?=dev
GIT_TAG=$(shell git describe --exact-match --tags 2> /dev/null || git rev-parse --short HEAD)

GANACHE_DOCKER=docker run \
	-p 8545:8545 \
	--rm -ti trufflesuite/ganache-cli:v6.9.1 \
	--deterministic

.PHONY: image
images:
	docker build --build-arg tag=$(GIT_TAG) -t ${REGISTRY}/deployment:$(VERSION) .

.PHONY: push
push:
	docker push ${REGISTRY}/deployment:$(VERSION)

.PHONY: node
node:
	${GANACHE_DOCKER}
