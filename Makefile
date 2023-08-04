build-localnets:
	echo "Building localnets..."
	docker build -t cosmoshub-localnet ./scripts/localnets/cosmoshub
	docker build -t evmos-localnet ./scripts/localnets/evmos
	docker build -t osmosis-localnet ./scripts/localnets/osmosis

start-localnets:
	./scripts/localnets/cosmoshub/start.sh
	./scripts/localnets/evmos/start.sh
	./scripts/localnets/osmosis/start.sh

stop-localnets:
	./scripts/localnets/cosmoshub/stop.sh
	./scripts/localnets/evmos/stop.sh
	./scripts/localnets/osmosis/stop.sh