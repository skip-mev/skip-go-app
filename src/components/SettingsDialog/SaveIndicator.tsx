import { CheckIcon } from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";

import { useSettingsStore } from "@/context/settings";

export const SaveIndicator = () => {
  const timeoutRef = useRef<number | null>(null);
  const [show, setShow] = useState(() => false);

  useEffect(() => {
    return useSettingsStore.subscribe(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShow(true);
      timeoutRef.current = window.setTimeout(() => setShow(false), 2000);
    });
  }, []);

  return (
    <div
      className={clsx(
        "pointer-events-none flex items-center space-x-1 text-sm font-medium text-green-500 transition",
        show ? "opacity-100" : "opacity-0",
      )}
    >
      <span>Settings saved!</span> <CheckIcon className="h-4 w-4" />
    </div>
  );
};
