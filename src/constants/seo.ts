import { APP_DOMAIN, APP_PROTOCOL } from "./api";

export const metadata = {
  name: "ibc.fun",
  shortName: "ibc.fun",
  description: "Interchain transfers and swaps on any Cosmos chain",
  domain: APP_DOMAIN,
  email: "support@skip.money",
  url: `${APP_PROTOCOL}://${APP_DOMAIN}`,
  github: {
    username: "skip-mev",
    url: "https://github.com/skip-mev/ibc-dot-fun",
  },
  twitter: {
    username: "@SkipProtocol",
    url: "https://twitter.com/SkipProtocol",
  },
  themeColor: "#ffdc61",
};
