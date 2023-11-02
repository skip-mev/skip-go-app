import { ArrowLeftIcon } from "@heroicons/react/20/solid";

import { useDisclosureKey } from "@/context/disclosures";

import { SlippageSetting } from "./SlippageSetting";

export const SettingsDialog = () => {
  const [isOpen, { close }] = useDisclosureKey("settingsDialog");

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-white rounded-3xl z-[999]">
      <div className="h-full px-4 py-6 overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-4 pb-2">
          <button
            className="hover:bg-neutral-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            onClick={close}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h3 className="font-bold text-xl">Swap Settings</h3>
          <div className="flex-grow" />
        </div>
        <SlippageSetting />
        <p className="p-2 text-sm text-neutral-500">
          Slippage is how much price movement you can tolerate between the time
          you send out a transaction and the time it&apos;s executed.
        </p>
      </div>
    </div>
  );
};
