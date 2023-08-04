build-localnets:
	echo "Building localnets..."
	docker build -t cosmoshub-localnet ./scripts/localnets/cosmoshub
	docker build -t evmos-localnet ./scripts/localnets/evmos

start-localnets:
	./scripts/localnets/cosmoshub/start.sh
	./scripts/localnets/evmos/start.sh	

stop-localnets:
	./scripts/localnets/cosmoshub/stop.sh
	./scripts/localnets/evmos/stop.sh