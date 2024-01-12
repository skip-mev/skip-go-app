export const isUserRejectedRequestError = (error: Error) => {
  if (
    // keplr | metamask
    error.message.toLowerCase().includes("rejected") ||
    // leap
    error.message.toLowerCase().includes("declined") ||
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error common user rejected request error code
    error.code === 4001
  ) {
    return true;
  }
  return false;
};
