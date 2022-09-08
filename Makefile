RELEASE_NAME=realio-network-explorer

template:
	helm template $(RELEASE_NAME) chart

install:
	helm upgrade --install $(RELEASE_NAME) chart

install-production:
	helm upgrade --install $(RELEASE_NAME) charts
