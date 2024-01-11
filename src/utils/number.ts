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
