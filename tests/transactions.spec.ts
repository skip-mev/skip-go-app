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
