import {
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/16/solid";
import * as Dialog from "@radix-ui/react-dialog";

import { useDisclosureKey } from "@/context/disclosures";

import { AdaptiveLink } from "../AdaptiveLink";
import { GasSetting } from "./GasSetting";
import { SaveIndicator } from "./SaveIndicator";
import { SlippageSetting } from "./SlippageSetting";

export const SettingsDialog = () => {
  const [isOpen, { close }] = useDisclosureKey("settingsDialog");
  return (
    <Dialog.Root modal open={isOpen}>
      <Dialog.Content className="absolute inset-0 bg-white rounded-3xl animate-fade-zoom-in">
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
            <SaveIndicator />
          </div>
          <GasSetting />
          <p className="p-2 text-sm text-neutral-500 [&_a]:text-red-500 [&_a:hover]:underline">
            Gas is used to meter transactions and allocate resources fairly
            among users. Users must pay a gas fee, usually in the native token,
            to have their transactions processed by the network.{" "}
            <AdaptiveLink href="https://docs.cosmos.network/main/glossary#gas">
              <QuestionMarkCircleIcon className="w-3.5 h-3.5 inline mb-1.5" />
            </AdaptiveLink>
          </p>
          <SlippageSetting />
          <p className="p-2 text-sm text-neutral-500 [&_a]:text-red-500 [&_a:hover]:underline">
            Slippage is how much price movement you can tolerate between the
            time you send out a transaction and the time it&apos;s executed.{" "}
            <AdaptiveLink href="https://medium.com/onomy-protocol/what-is-slippage-in-defi-62a0d068feb3">
              <QuestionMarkCircleIcon className="w-3.5 h-3.5 inline mb-1.5" />
            </AdaptiveLink>
          </p>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
