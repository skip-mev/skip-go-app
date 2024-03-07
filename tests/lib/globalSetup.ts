// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function globalSetup(config) {
  dotenv.config({
    path: ".env",
    override: true,
  });
}

module.exports = globalSetup;
