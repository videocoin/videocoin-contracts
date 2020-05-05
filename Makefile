REGISTRY=registry.videocoin.net/contracts
VERSION ?= dev


.PHONY: images
images:
	docker build -t ${REGISTRY}/contracts:$(VERSION) .

.PHONY: push
push:
	docker push ${REGISTRY}/contracts:$(VERSION)