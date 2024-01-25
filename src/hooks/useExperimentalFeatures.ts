import { ExperimentalFeature } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";

export function useExperimentalFeatures() {
  return useQuery({
    queryKey: ["USE_EXPERIMENTAL_FEATURES"] as const,
    queryFn: async () => {
      try {
        const response = await fetch("/api/flags");
        const data = (await response.json()) as ExperimentalFeature[];
        return data;
      } catch {
        //
      }
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
