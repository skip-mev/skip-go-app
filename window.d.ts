import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window extends KeplrWindow {}
}
