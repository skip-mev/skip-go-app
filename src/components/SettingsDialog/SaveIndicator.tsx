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
        "text-green-500 text-sm font-medium flex items-center space-x-1 transition",
        show ? "opacity-100" : "opacity-0",
      )}
    >
      <span>Settings saved!</span> <CheckIcon className="w-4 h-4" />
    </div>
  );
};
