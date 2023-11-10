import "@testing-library/jest-dom/extend-expect";

global.ResizeObserver = require("resize-observer-polyfill");

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.TextEncoder = require("util").TextEncoder;

// suppress zustand deprecation notice to clear out logs
global.console.warn = (...args) =>
  args[0]?.includes("vanilla store") ? void 0 : global.console.warn;
