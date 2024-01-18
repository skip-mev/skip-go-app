import { BrowserType } from "@playwright/test";

import * as playwright from "../commands/playwright";

export async function initialSetup(playwrightInstance: BrowserType) {
  if (playwrightInstance) {
    await playwright.init(playwrightInstance);
  } else {
    await playwright.init();
  }

  await playwright.assignWindows();
  await playwright.assignActiveTabName("keplr");

  await importWallet("test test test test test test test test test test test junk", "Tester@1234");

  // keplrWindow
}

async function importWallet(secretWords: string, password: string) {
  const keplrWindow = playwright.keplrWindow();

  // await keplrWindow.pause();

  await keplrWindow.getByText(/import an existing wallet/i).click();

  await keplrWindow.getByText(/use recovery phrase or private key/i).click();

  const inputs = await keplrWindow.getByRole("textbox").all();

  for (const [index, word] of secretWords.split(" ").entries()) {
    await inputs[index].fill(word);
    // keplrWindow.fill()
    // await playwright.waitAndType(
    // firstTimeFlowImportPageElements.secretWordsInput(index),
    // word,
    // );
  }

  await keplrWindow
    .getByRole("button", {
      name: "Import",
      exact: true,
    })
    .click();

  await keplrWindow
    .getByRole("textbox", {
      name: "e.g. Trading, NFT Vault, Investment",
    })
    .fill("Test Wallet");

  const [passwordField, confirmPasswordField] = await keplrWindow
    .getByPlaceholder("At least 8 characters in length")
    .all();

  await passwordField.fill(password);
  await confirmPasswordField.fill(password);

  await keplrWindow
    .getByRole("button", {
      name: "Next",
      exact: true,
    })
    .click();

  await keplrWindow
    .getByRole("button", {
      name: "Save",
      exact: true,
    })
    .click();

  // await keplrWindow.pause();
}
