import "@testing-library/jest-dom/extend-expect";

global.ResizeObserver = require("resize-observer-polyfill");

// eslint-disable-next-line @typescript-eslint/no-var-requires
global.TextEncoder = require("util").TextEncoder;
