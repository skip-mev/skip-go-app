// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('ts-jest').JestConfigWithTsJest} */
const customJestConfig = {
  preset: "ts-jest/presets/js-with-ts-esm",
  moduleNameMapper: {
    isows: "<rootDir>/node_modules/isows/_cjs/index.js", // https://github.com/wagmi-dev/viem/issues/1329
    tinykeys: "<rootDir>/node_modules/tinykeys/dist/tinykeys.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/tests/",
  ],
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { useESM: true }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!isows/)", // https://github.com/wagmi-dev/viem/issues/1329
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
