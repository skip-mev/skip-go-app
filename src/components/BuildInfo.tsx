import { ReactNode, useEffect, useState } from "react";
import { tinykeys } from "tinykeys";

import { API_URL } from "@/constants/api";
import { cn } from "@/utils/ui";

const githubUrl = "https://github.com/skip-mev/ibc-dot-fun";

const buildInfo: [string, ReactNode][] = [
  ["node env", process.env.NODE_ENV],
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
  const [show, setShow] = useState(() => process.env.NEXT_PUBLIC_VERCEL_ENV !== "production");

  useEffect(() => {
    return tinykeys(window, {
      "Shift+Escape": () => setShow((prev) => !prev),
    });
  }, []);

  if (!show) return null;

  return (
    <div className={cn("fixed bottom-2 left-2", "w-[300px] space-y-2 rounded border bg-white p-2 shadow-md")}>
      <dl>
        {buildInfo.map(
          ([k, v], i) =>
            v && (
              <div
                key={i}
                className="grid grid-cols-3 space-x-2 py-px text-sm"
              >
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
      <hr />
      <button
        className="relative w-full text-center text-xs text-neutral-500 before:absolute before:-inset-1 before:content-['']"
        onClick={() => setShow((prev) => !prev)}
      >
        shift+esc to toggle, click here to close
      </button>
    </div>
  );
};
