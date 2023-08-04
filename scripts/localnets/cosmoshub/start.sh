#!/bin/sh

SCRIPT_DIR="$(realpath "$(dirname "$0")")"

echo "Using temporary dir $SCRIPT_DIR"

# Use a fresh volume for every start
# docker volume rm -f cosmoshub_data


#   # --detach \

# docker run --rm \
#   -p 26657:26657 \
#   -p 1317:1317 \
#   -p 9090:9090 \
#   --name cosmoshub-localnet \
#   --mount type=bind,source="/Users/thal0x/Documents/skip/ibc-dot-fun/scripts/localnets/cosmoshub/template",target=/template \
#   --mount type=volume,source=cosmoshub_data,target=/root \
#   cosmoshub-localnet
#   # cosmoshub-localnet start --home /.cosmoshub --x-crisis-skip-assert-invariants --rpc.laddr tcp://0.0.0.0:26657
# sleep 1

# echo "cosmoshub-localnet running"  