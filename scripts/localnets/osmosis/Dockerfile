FROM golang:1.20-alpine as builder

ARG GIT_VERSION
ARG GIT_COMMIT

RUN apk add --no-cache \
  git \
  ca-certificates \
  build-base \
  linux-headers

ARG git_repository=https://github.com/osmosis-labs/osmosis
ARG git_version=main
RUN git clone --recursive --branch $git_version $git_repository /build_dir

WORKDIR /build_dir

RUN --mount=type=cache,target=/root/.cache/go-build \
  --mount=type=cache,target=/root/go/pkg/mod \
  go mod download

# Cosmwasm - Download correct libwasmvm version
RUN ARCH=$(uname -m) && WASMVM_VERSION=$(go list -m github.com/CosmWasm/wasmvm | sed 's/.* //') && \
  wget https://github.com/CosmWasm/wasmvm/releases/download/$WASMVM_VERSION/libwasmvm_muslc.$ARCH.a \
  -O /lib/libwasmvm_muslc.a && \
  # verify checksum
  wget https://github.com/CosmWasm/wasmvm/releases/download/$WASMVM_VERSION/checksums.txt -O /tmp/checksums.txt && \
  sha256sum /lib/libwasmvm_muslc.a | grep $(cat /tmp/checksums.txt | grep libwasmvm_muslc.$ARCH | cut -d ' ' -f 1)  

# Build osmosisd binary
RUN --mount=type=cache,target=/root/.cache/go-build \
  --mount=type=cache,target=/root/go/pkg/mod \
  GOWORK=off go build \
  -mod=readonly \
  -tags "netgo,ledger,muslc" \
  -ldflags \
  "-X github.com/cosmos/cosmos-sdk/version.Name="osmosis" \
  -X github.com/cosmos/cosmos-sdk/version.AppName="osmosisd" \
  -X github.com/cosmos/cosmos-sdk/version.Version=${GIT_VERSION} \
  -X github.com/cosmos/cosmos-sdk/version.Commit=${GIT_COMMIT} \
  -X github.com/cosmos/cosmos-sdk/version.BuildTags=netgo,ledger,muslc \
  -w -s -linkmode=external -extldflags '-Wl,-z,muldefs -static'" \
  -trimpath \
  -o /build_dir/build/osmosisd \
  /build_dir/cmd/osmosisd/main.go    

FROM "gcr.io/distroless/static-debian11"

COPY --from=builder /build_dir/build/osmosisd /bin/osmosisd

ENV HOME /osmosis
WORKDIR $HOME

ENTRYPOINT ["osmosisd"]
