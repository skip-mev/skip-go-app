export function getNodeProxyEndpoint(...args: string[]) {
  return `${process.env.APP_URL}/api/nodes/${args.join("/")}`;
}

export function getPolkachuAuthHeader() {
  if (!(process.env.POLKACHU_USER && process.env.POLKACHU_PASSWORD)) {
    throw new Error("env POLKACHU_USER or POLKACHU_PASSWORD is not set");
  }
  const userpass = `${process.env.POLKACHU_USER}:${process.env.POLKACHU_PASSWORD}`;
  return `Basic ${Buffer.from(userpass).toString("base64")}`;
}
