import { init } from "@amplitude/analytics-browser";

import { dependencies } from "../../package.json";

let isAmplitudeInitialized = false;

export const initAmplitude = () => {
  if (isAmplitudeInitialized) return;
  init("14616a575f32087cf0403ab8f3ea3ce0", {
    appVersion: dependencies["@skip-go/widget"],
  });
  isAmplitudeInitialized = true;
};
