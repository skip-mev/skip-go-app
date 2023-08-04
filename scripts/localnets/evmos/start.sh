#!/bin/sh

SCRIPT_DIR="$(realpath "$(dirname "$0")")"

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/evmos.XXXXXXXXX")
chmod 777 "$TMP_DIR"
echo "Using temporary dir $TMP_DIR"

cp -R "$SCRIPT_DIR/.evmos" $TMP_DIR

# Use a fresh volume for every start
docker volume rm -f evmos_data


docker run --rm \
  --detach \
  -p 26658:26657 \
  -p 1318:1317 \
  -p 9091:9090 \
  --name evmos-localnet \
  --mount type=bind,source="$TMP_DIR/.evmos",target=/.evmos \
  --mount type=volume,source=evmos_data,target=/root \
  evmos-localnet start --home /.evmos --x-crisis-skip-assert-invariants --api.enable --api.enabled-unsafe-cors --rpc.laddr tcp://0.0.0.0:26657

sleep 1

echo "evmos-localnet running"