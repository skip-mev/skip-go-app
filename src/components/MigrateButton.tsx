import { track } from "@amplitude/analytics-browser";
import { useState } from "react";

import { ThinArrowIcon } from "./ThinArrowIcon";

const MIGRATION_DOCS_URL = "https://skip-go-mintae-usdc-migration-guide.mintlify.site/app/usdc-n-manual-migration";
const NOBLE_USDC_IMG =
  "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.png";

const MigrateButton = () => {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <>
      {/* mobile / short viewport: one-line floating bar */}
      <div className="fixed bottom-6 left-4 right-4 z-10 flex items-center gap-3 rounded-2xl border-2 border-solid border-red-500 bg-black px-4 py-3 font-diatype text-white sm:[@media(min-height:720px)]:hidden">
        <img
          src={NOBLE_USDC_IMG}
          alt="Noble USDC"
          width={36}
          height={36}
          className="h-9 w-9 flex-shrink-0 rounded-full ring-2 ring-red-500/50"
        />
        <span className="flex-1">
          <span className="block whitespace-nowrap text-[15px] font-semibold text-red-500">
            Noble USDC.n is being deprecated
          </span>
          <span className="block text-[12px] text-white/70">migrate to USDC.inj</span>
        </span>
        <a
          className="inline-flex flex-shrink-0 items-center font-semibold text-white no-underline"
          href={MIGRATION_DOCS_URL}
          target="_blank"
          onClick={() => track("go app migrate usdc button - clicked")}
        >
          <ThinArrowIcon />
        </a>
      </div>

      {/* desktop (wide + tall enough): tall card */}
      <div className="fixed bottom-24 right-8 z-10 hidden w-[400px] flex-col overflow-hidden rounded-3xl border-2 border-solid border-red-500 bg-black font-diatype text-white sm:[@media(min-height:720px)]:flex">
        <div className="flex items-center gap-3 p-5">
          <img
            src={NOBLE_USDC_IMG}
            alt="Noble USDC"
            width={40}
            height={40}
            className="h-10 w-10 flex-shrink-0 rounded-full ring-2 ring-red-500/50"
          />
          <span className="flex-1 text-[20px] font-semibold">Noble USDC.n</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setHidden(true)}
            className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-black text-white/70 transition-colors hover:text-white"
          >
            <span className="text-[32px] leading-none">×</span>
          </button>
        </div>

        <div className="flex flex-col px-5 pb-6 pt-2">
          <strong className="text-[30px] font-bold leading-tight">
            <span className="block text-white">Is Being</span>
            <span className="block text-red-500">Deprecated</span>
          </strong>
          <div className="my-5 h-px bg-red-500/40" />
          <span className="mb-4 text-[15px] text-white/70">
            Migrate to <span className="font-semibold text-white">USDC.inj</span>
          </span>
          <a
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-4 text-[18px] font-semibold text-white no-underline transition-colors hover:bg-red-600"
            href={MIGRATION_DOCS_URL}
            target="_blank"
            onClick={() => track("go app migrate usdc button - clicked")}
          >
            Migrate Now
            <ThinArrowIcon />
          </a>
        </div>
      </div>
    </>
  );
};

export default MigrateButton;
