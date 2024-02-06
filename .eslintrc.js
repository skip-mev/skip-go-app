// @ts-check

/**
 * @type {import("eslint").Linter.Config}
 * @see https://eslint.org/docs/latest/use/configure/
 */
const eslintConfig = {
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["simple-import-sort"],
  rules: {
    "@next/next/no-img-element": ["off"],
    "simple-import-sort/exports": ["warn"],
    "simple-import-sort/imports": ["warn"],
  },
  ignorePatterns: ["node_modules/", ".next/", "out/", "src/chains/*"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      rules: {
        "@typescript-eslint/ban-types": [
          "error",
          {
            types: {
              // un-ban a type that's banned by default
              "{}": false,
            },
            extendDefaults: true,
          },
        ],
        "@typescript-eslint/no-explicit-any": ["warn"],
      },
    },
  ],
  root: true,
};

module.exports = eslintConfig;
