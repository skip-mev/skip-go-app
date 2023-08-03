#!/bin/sh

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/simapp.XXXXXXXXX")
chmod 777 "$TMP_DIR"
echo "Using temporary dir $TMP_DIR"
SIMD_LOGFILE="$TMP_DIR/simd.log"

# Use a fresh volume for every start
docker volume rm -f cosmoshub_data

docker run --rm \
  --detach \
  -p 26657:26657 \
  -p 1317:1317 \
  -p 9090:9090 \
  --name cosmoshub-localnet \
  --mount type=bind,source="/Users/thal0x/Documents/skip/ibc-dot-fun/scripts/localnets/cosmoshub/.cosmoshub",target=/.cosmoshub \
  --mount type=volume,source=cosmoshub_data,target=/root \
  cosmoshub-localnet start --home /.cosmoshub --x-crisis-skip-assert-invariants --rpc.laddr tcp://0.0.0.0:26657

sleep 1

echo "cosmoshub-localnet running"  