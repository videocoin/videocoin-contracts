REGISTRY=registry.videocoin.net/contracts
VERSION ?= dev


.PHONY: images
images:
	docker build -t ${REGISTRY}/deployment:$(VERSION) .

.PHONY: push
push:
	docker push ${REGISTRY}/deployment:$(VERSION)