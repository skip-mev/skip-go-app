import { ArrowRightIcon } from "@heroicons/react/20/solid";

import { cn } from "@/utils/ui";

import { AdaptiveLink, AdaptiveLinkProps } from "./AdaptiveLink";

function SkipBanner({ className, ...props }: Omit<AdaptiveLinkProps, "href">) {
  return (
    <AdaptiveLink
      href="https://api-docs.skip.money"
      className={cn("overflow-hidden bg-[#FF486E] py-2 text-sm font-semibold text-white", className)}
      {...props}
    >
      <div className="flex w-[5000px] animate-banner-rotate items-center">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            className="inline-flex w-[1000px] items-center justify-around uppercase"
            key={i}
          >
            <span>Powered by the Skip API</span>
            <div className="inline-flex items-center gap-1 rounded px-2 py-1 pr-1">
              <span>Learn more & integrate</span>
              <ArrowRightIcon className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    </AdaptiveLink>
  );
}

export default SkipBanner;
