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

test("Injective INJ -> Cosmoshub ATOM", async ({ page }) => {
  await initKeplr();
  await expectPageLoaded(page);

  await selectSource(page, "injective", "inj");
  await selectDestination(page, "cosmos hub", "atom");

  await connectSource(page);

  await fillAmount(page, "0.13");

  await connectDestination(page);

  await e2eTest(page);
});
