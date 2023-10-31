export const raise = (message?: string, opts?: ErrorOptions): never => {
  throw new Error(message, opts);
};
