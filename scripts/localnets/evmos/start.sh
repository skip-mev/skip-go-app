#!/bin/sh

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/simapp.XXXXXXXXX")
chmod 777 "$TMP_DIR"
echo "Using temporary dir $TMP_DIR"
SIMD_LOGFILE="$TMP_DIR/simd.log"

# Use a fresh volume for every start
docker volume rm -f evmos_data

  
  
docker run --rm \
  --detach \
  -p 26657:26657 \
  -p 26658:26658 \
  -p 1317:1317 \
  -p 9090:9090 \
  --name evmos-localnet \
  --mount type=bind,source="/Users/thal0x/Documents/skip/ibc-dot-fun/scripts/localnets/evmos/.evmos",target=/.evmos \
  --mount type=volume,source=evmos_data,target=/root \
  evmos-localnet start --home /.evmos --x-crisis-skip-assert-invariants --api.enable --api.enabled-unsafe-cors --rpc.laddr tcp://0.0.0.0:26657

sleep 1

echo "evmos-localnet running"