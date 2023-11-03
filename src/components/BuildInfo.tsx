import { clsx } from "clsx";
import { ReactNode, useEffect, useState } from "react";

import { API_URL } from "@/constants/api";

const githubUrl = "https://github.com/skip-mev/ibc-dot-fun";

const buildInfo: [string, ReactNode][] = [
  ["node env", process.env.NODE_ENV],
  ["vercel", process.env.VERCEL ? "true" : "false"],
  ["api url", API_URL],
  [
    "commit",
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
      ? `${githubUrl}/commit/${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}`
      : null,
  ],
  [
    "pull request",
    process.env.NEXT_PUBLIC_GIT_PULL_REQUEST_ID
      ? `${githubUrl}/pull/${process.env.NEXT_PUBLIC_GIT_PULL_REQUEST_ID}`
      : null,
  ],
];

export const BuildInfo = () => {
  const [show, setShow] = useState(
    () => process.env.NEXT_PUBLIC_VERCEL_ENV !== "production",
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && e.shiftKey) {
        setShow((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!show) return null;

  return (
    <div
      className={clsx(
        "fixed bottom-2 left-2",
        "bg-white border p-2 rounded shadow-md space-y-2 w-[300px]",
      )}
    >
      <dl>
        {buildInfo.map(
          ([k, v], i) =>
            v && (
              <div key={i} className="grid grid-cols-3 space-x-2 py-px text-sm">
                <dd className="col-span-1 truncate">{k}</dd>
                <dt className="col-span-2 truncate">
                  {typeof v === "string" && /^https?:\/\//.test(v) ? (
                    <a
                      href={v}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:underline"
                    >
                      {v.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    v
                  )}
                </dt>
              </div>
            ),
        )}
      </dl>
      <div className="text-end text-xs text-neutral-500">
        shift+esc to toggle
      </div>
    </div>
  );
};
