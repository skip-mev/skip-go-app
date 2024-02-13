const { GasPrice } = require("@cosmjs/stargate");

/**
 * @type {Record<string, GasPrice>}
 */
exports.CUSTOM_GAS_PRICE_CHAIN_IDS = {
  "dymension_1100-1": GasPrice.fromString("20000000000adym"),
  "noble-1": GasPrice.fromString("0.0uusdc"),
};
