#!/bin/sh

SCRIPT_DIR="$(realpath "$(dirname "$0")")"

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/osmosis.XXXXXXXXX")
chmod 777 "$TMP_DIR"
echo "Using temporary dir $TMP_DIR"

cp -R "$SCRIPT_DIR/.osmosis" $TMP_DIR

# Use a fresh volume for every start
docker volume rm -f osmosis_data


docker run --rm \
  --detach \
  -p 26659:26657 \
  -p 1319:1317 \
  -p 9092:9090 \
  --name osmosis-localnet \
  --mount type=bind,source="$TMP_DIR/.osmosis",target=/.osmosis \
  --mount type=volume,source=osmosis_data,target=/root \
  osmosis-localnet start --home /.osmosis --x-crisis-skip-assert-invariants --rpc.laddr tcp://0.0.0.0:26657

sleep 1

echo "osmosis-localnet running"