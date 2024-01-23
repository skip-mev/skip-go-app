import { BigNumber } from "bignumber.js";
import { formatUnits } from "ethers";

export function formatNumberWithCommas(str: string | number) {
  const text = String(str);
  // Format integer part with commas every three digits
  const parts = text.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.join(".");
}

export function formatNumberWithoutCommas(str: string | number) {
  return String(str).replace(/,/g, "");
}

export function getAmountWei(amount?: string, decimals = 6) {
  if (!amount || !amount) return "0";
  try {
    return new BigNumber(formatNumberWithoutCommas(amount)).shiftedBy(decimals ?? 6).toFixed(0);
  } catch (err) {
    return "0";
  }
}

export function parseAmountWei(amount?: string, decimals = 6) {
  if (!amount) return "0";
  try {
    return formatUnits(amount.replace(/,/g, ""), decimals ?? 6);
  } catch (err) {
    return "0";
  }
}
