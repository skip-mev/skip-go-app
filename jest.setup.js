import "@testing-library/jest-dom";

// suppress zustand deprecation notice to clear out logs
global.console.warn = (...args) =>
  args[0]?.includes("vanilla store") ? void 0 : global.console.warn;
