// hooks/useFeatureRollout.js
import { useEffect, useState } from "react";

import { getCookie, setCookie } from "@/utils/cookies";

export function useFeatureEnabled(featureName: string): boolean {
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let featureEnabled = getCookie(featureName);
      const rolloutPercentage = parseInt(process.env.NEXT_PUBLIC_FEATURE_ROLLOUT_PERCENTAGE || "0", 10);

      if (featureEnabled === undefined) {
        const randomNumber = Math.random() * 100;
        featureEnabled = randomNumber < rolloutPercentage ? "true" : "false";

        // persist cookie for 5 minutes
        setCookie(featureName, featureEnabled, 5);
      }

      setIsFeatureEnabled(featureEnabled === "true");
    }
  }, [featureName]);

  return isFeatureEnabled;
}
