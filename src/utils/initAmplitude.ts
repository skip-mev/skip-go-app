import { init } from "@amplitude/analytics-browser";

import packageJson from "../../package.json";

let isAmplitudeInitialized = false;

const serverUrl = "https://go.skip.build/api/amplitude";

export const initAmplitude = () => {
  if (isAmplitudeInitialized || typeof window === "undefined") return;
  init("14616a575f32087cf0403ab8f3ea3ce0", {
    appVersion: packageJson.dependencies["@skip-go/widget"],
    serverUrl: `${serverUrl}/httpapi`,
  });
  isAmplitudeInitialized = true;
};
