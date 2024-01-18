// @ts-check

const { devDependencies } = require("./package.json");

/**
 * @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions}
 * @see https://prettier.io/docs/en/configuration
 */
const prettierConfig = {
  endOfLine: "auto",
  plugins: Object.keys(devDependencies).filter((dep) => {
    return dep.startsWith("prettier-plugin-");
  }),
  printWidth: 120,
  semi: true,
  singleAttributePerLine: true,
  singleQuote: false,
  trailingComma: "all",

  tailwindFunctions: ["clsx", "cn"],
};

module.exports = prettierConfig;
