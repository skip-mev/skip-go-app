import "@testing-library/jest-dom/extend-expect";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.ResizeObserver = require("resize-observer-polyfill");
