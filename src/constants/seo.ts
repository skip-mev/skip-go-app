import { APP_DOMAIN, APP_PROTOCOL } from "./api";

export const skipMetadata = {
  name: "Skip:Go - Anything Anywhere",
  shortName: "Skip:Go",
  description: "Everything you need to seamlessly connect your application, protocol, or ecosystem across chains.",
  domain: APP_DOMAIN,
  email: "support@skip.build",
  images: [{ url: `${APP_PROTOCOL}://${APP_DOMAIN}/social-thumbnail.png` }],
  url: `${APP_PROTOCOL}://${APP_DOMAIN}`,
  github: {
    username: "skip-mev",
    url: "https://github.com/skip-mev/skip-go-app",
  },
  twitter: {
    username: "@SkipProtocol",
    url: "https://twitter.com/SkipProtocol",
  },
  themeColor: "##ff86ff",
};

export const cosmosMetadata = {
  name: "IBC Eureka - One network, infinite chains.",
  shortName: "Eureka",
  description: "Everything you need to seamlessly connect your application, protocol, or ecosystem across chains.",
  domain: APP_DOMAIN,
  email: "support@skip.build",
  images: [{ url: `${APP_PROTOCOL}://${APP_DOMAIN}/cosmos-social-thumbnail.png` }],
  url: `${APP_PROTOCOL}://${APP_DOMAIN}`,
  github: {
    username: "skip-mev",
    url: "https://github.com/skip-mev/skip-go-app",
  },
  twitter: {
    username: "@interchain_io",
    url: "https://x.com/interchain_io",
  },
  themeColor: "##ff86ff",
};
