FROM golang:1.20.3-buster as BUILD
ARG git_repository=https://github.com/evmos/evmos.git
ARG git_version=main
RUN git clone --recursive --branch $git_version $git_repository /build_dir
WORKDIR /build_dir
# RUN go mod download github.com/miguelmota/go-ethereum-hdwallet
RUN make build

FROM gcr.io/distroless/base-debian11:latest
ARG git_repository=https://github.com/evmos/evmos.git
ARG git_version=main
ARG name="evmos"
ARG summary="Distroless container build for ${name}."
LABEL description="${summary}" \
  maintainer="cloudnull.io <kevin@cloudnull.com>" \
  app.kubernetes.io/name="${name}" \
  app.kubernetes.io/version="${git_version}" \
  org.opencontainers.image.title="${name}" \
  org.opencontainers.artifact.description="${summary}" \
  org.opencontainers.image.url="https://github.com/oshied/protocol-forge" \
  org.opencontainers.image.authors="kevin@cloudnull.com" \
  org.opencontainers.image.revision="${git_version}" \
  org.opencontainers.image.source="${git_repository}" \
  org.opencontainers.image.vendor="cloudnull.io" \
  org.opencontainers.image.description="${summary}"
WORKDIR /usr/local/bin
COPY --from=BUILD /build_dir/build/evmosd /usr/local/bin/evmosd
ENTRYPOINT ["/usr/local/bin/evmosd"]