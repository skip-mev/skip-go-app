import { test } from "./lib/fixtures";
import {
  connectDestination,
  connectSource,
  e2eTest,
  expectPageLoaded,
  fillAmount,
  initKeplr,
  selectDestination,
  selectSource,
} from "./utils";

test("Cosmoshub ATOM -> Noble USDC", async ({ page }) => {
  await initKeplr();
  await expectPageLoaded(page);

  await selectSource(page, "cosmos hub", "atom");
  await selectDestination(page, "noble", "usdc");

  await connectSource(page);

  await fillAmount(page, "0.45");

  await connectDestination(page);

  await e2eTest(page);
});
