// hooks/useFeatureRollout.js
import { useEffect, useState } from "react";

import { getCookie, setCookie } from "@/utils/cookies";

export function useFeatureEnabled(featureName: string): boolean {
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const rolloutPercentage = parseInt(process.env.NEXT_PUBLIC_FEATURE_ROLLOUT_PERCENTAGE || "0", 10);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let featureEnabled = getCookie(featureName);

      if (featureEnabled === undefined) {
        const randomNumber = Math.random() * 100;
        featureEnabled = randomNumber < rolloutPercentage ? "true" : "false";
        setCookie(featureName, featureEnabled);
      }

      setIsFeatureEnabled(featureEnabled === "true");
    }
  }, [featureName, rolloutPercentage]);

  return isFeatureEnabled;
}
