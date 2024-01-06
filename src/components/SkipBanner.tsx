import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { clsx } from "clsx";

import { AdaptiveLink, AdaptiveLinkProps } from "./AdaptiveLink";

function SkipBanner({ className, ...props }: Omit<AdaptiveLinkProps, "href">) {
  return (
    <AdaptiveLink
      href="https://skip.money/docs/frontends"
      className={clsx(
        "bg-[#FF486E] font-semibold text-sm text-white py-2 overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="w-[5000px] flex items-center animate-banner-rotate">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            className="w-[1000px] inline-flex items-center justify-around uppercase"
            key={i}
          >
            <span>Powered by the Skip API</span>
            <div className="px-2 py-1 pr-1 rounded inline-flex items-center gap-1">
              <span>Learn more & integrate</span>
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </AdaptiveLink>
  );
}

export default SkipBanner;
