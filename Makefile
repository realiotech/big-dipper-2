RELEASE_NAME=realio-network-explorer

template:
	helm template $(RELEASE_NAME) chart

install:
	helm upgrade --install $(RELEASE_NAME) chart -f values.yaml

install-production:
	helm upgrade -n production --install $(RELEASE_NAME) chart -f values-production.yaml

build:
	docker build -t registry.k8s.stage.realio.fund/realio-network-explorer:latest .

deploy: build
	docker push registry.k8s.stage.realio.fund/realio-network-explorer:latest