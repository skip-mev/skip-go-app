export async function findFirstWorkingEndpoint(endpoints: string[], type: "rpc" | "rest"): Promise<string | null> {
  for (const endpoint of endpoints) {
    try {
      const url = (() => {
        switch (type) {
          case "rpc": {
            const rpc = new URL(endpoint);
            return rpc.toString();
          }
          case "rest": {
            const url = new URL("cosmos/base/tendermint/v1beta1/node_info", endpoint);
            return url.toString();
          }
          default:
            throw new Error(`Unknown endpoint type: ${type}`);
        }
      })();
      const response = await fetch(url);
      if (response.ok) {
        return endpoint;
      } else {
        console.error(`Error: ${endpoint} responded with status ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}: ${(error as Error).message}`);
    }
  }

  console.error("No working endpoints found.");
  return null;
}
