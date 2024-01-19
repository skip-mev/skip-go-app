import { ArrowDownOnSquareIcon } from "@heroicons/react/20/solid";
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
    window.__DEBUG_TRIGGER_VERSION_TOAST = triggerToast;
    if (!data) return;
    if (!data.isCurrent) {
      triggerToast();
    }
  }, [data]);

  return null;
}

function triggerToast() {
  toast(
    <div>
      <p>A new version of ibc.fun is available.</p>
      <button
        className="text-red-500 before:absolute before:inset-0 before:content-[''] hover:underline"
        onClick={() => window.location.reload()}
      >
        Click here to reload page
      </button>
    </div>,
    {
      id: "update",
      icon: <ArrowDownOnSquareIcon className="h-6 w-6 fill-red-500" />,
      duration: Infinity,
    },
  );
}

declare global {
  interface Window {
    __DEBUG_TRIGGER_VERSION_TOAST: () => void;
  }
}
