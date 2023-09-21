import { type BrowserContext, chromium, test as base } from "@playwright/test";

import { prepareKeplr } from "./keplr";

export const test = base.extend<{ context: BrowserContext }>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    // download keplr
    await prepareKeplr();

    // prepare browser args
    const browserArgs = [
      // `--disable-extensions-except=${metamaskPath}`,
      // `--load-extension=${metamaskPath}`,
      "--remote-debugging-port=9222",
    ];

    if (process.env.CI) {
      browserArgs.push("--disable-gpu");
    }

    if (process.env.HEADLESS_MODE) {
      browserArgs.push("--headless=new");
    }

    // launch browser
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: browserArgs,
    });

    await use(context);

    await context.close();
  },
});

export const expect = test.expect;
