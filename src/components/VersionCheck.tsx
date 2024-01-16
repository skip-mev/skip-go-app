import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

import { route, version } from "@/pages/api/version";

export function VersionCheck() {
  const queryKey = useMemo(() => ["USE_CHECK_VERSION", version] as const, []);

  const { data } = useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, version] }) => {
      const response = await fetch(route);
      const apiVersion = await response.text();
      return {
        isCurrent: apiVersion === version,
      };
    },
    enabled: !!version,
  });

  useEffect(() => {
    if (!data) return;
    if (!data.isCurrent) {
      toast(
        <div>
          <p>A new version of ibc.fun is available.</p> <br />
          <button className="text-red-500 hover:underline">Refresh page</button>
        </div>,
        {
          id: "update",
          duration: Infinity,
        },
      );
    }
  }, [data]);

  return null;
}
