import {
  ArrowLeftIcon,
  CheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/20/solid";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { useMemo, useState } from "react";

import { useJsonDisclosure } from "@/context/disclosures";

export const JsonDialog = () => {
  const [state, { close }] = useJsonDisclosure();

  const [copied, setCopied] = useState(() => false);

  const onCopy = async () => {
    if (!state) return;
    const timeout = 1000;
    await navigator.clipboard.writeText(JSON.stringify(state.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), timeout);
  };

  const ClipboardIcon = useMemo(() => {
    return copied ? CheckIcon : ClipboardDocumentIcon;
  }, [copied]);

  if (!state) return null;

  return (
    <Dialog.Root modal open>
      <Dialog.Content className="absolute inset-0 bg-white rounded-3xl overflow-hidden">
        <button
          className={clsx(
            "absolute top-5 right-4",
            "text-sm px-2 py-1 border rounded-lg transition-colors",
            "flex items-center justify-center space-x-1 flex-grow",
            {
              "bg-neutral-100 hover:bg-neutral-200": !copied,
              "bg-green-100 hover:bg-green-200": copied,
              "border-green-400 text-green-900": copied,
            },
          )}
          onClick={onCopy}
        >
          <span>Copy to clipboard</span>
          <ClipboardIcon className="w-4 h-4" />
        </button>
        <div className="h-full px-4 py-6 overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-4 pb-2">
            <button
              className="hover:bg-neutral-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              onClick={close}
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h3 className="font-bold text-xl">
              {state.title || "JSON Viewer"}
            </h3>
            <div className="flex-grow" />
          </div>
          <pre className="border font-mono p-2 rounded-lg text-xs overflow-auto">
            {JSON.stringify(state.data, null, 2)}
          </pre>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
