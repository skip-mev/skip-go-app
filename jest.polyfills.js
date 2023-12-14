// https://mswjs.io/docs/faq/#referenceerror-fetch-is-not-defined-in-nodejs
// https://mswjs.io/docs/faq/#requestresponsetextencoder-is-not-defined-jest

const { ReadableStream } = require("stream/web");
const { clearImmediate, setImmediate } = require("timers");
const { TextDecoder, TextEncoder } = require("util");

Object.defineProperties(global, {
  ReadableStream: { value: ReadableStream },
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  clearImmediate: { value: clearImmediate },
  setImmediate: { value: setImmediate },
});

const { Blob, File } = require("buffer");
const { fetch, FormData, Headers, Request, Response } = require("undici");

Object.defineProperties(global, {
  Blob: { value: Blob },
  File: { value: File },
  FormData: { value: FormData },
  Headers: { value: Headers },
  Request: { value: Request },
  ResizeObserver: { value: require("resize-observer-polyfill") },
  Response: { value: Response },
  fetch: { value: fetch, writable: true },
});
