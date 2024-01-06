import { ArrowRightIcon } from "@heroicons/react/20/solid";

import { AdaptiveLink } from "./AdaptiveLink";

function SkipBanner() {
  return (
    <AdaptiveLink
      href="https://skip.money/docs/frontends"
      className="bg-[#FF486E] font-semibold text-sm text-white py-2 z-50 top-0 inset-x-0 overflow-hidden sm:sticky group"
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
