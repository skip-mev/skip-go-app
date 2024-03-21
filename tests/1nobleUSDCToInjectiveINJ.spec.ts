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

test("Noble USDC -> Injective INJ", async ({ page }) => {
  await initKeplr();
  await expectPageLoaded(page);

  await selectSource(page, "noble", "usdc");
  await selectDestination(page, "injective", "inj");

  await connectSource(page);

  await fillAmount(page, "5");

  await connectDestination(page);

  await e2eTest(page);
});
