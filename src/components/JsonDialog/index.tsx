import { ArrowLeftIcon } from "@heroicons/react/20/solid";

import { useJsonDisclosure } from "@/context/disclosures";

export const JsonDialog = () => {
  const [state, { close }] = useJsonDisclosure();

  if (!state) return null;

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
          <h3 className="font-bold text-xl">{state.title || "JSON Viewer"}</h3>
          <div className="flex-grow" />
        </div>
        <pre className="border font-mono p-2 rounded-lg text-xs overflow-auto">
          {JSON.stringify(state.data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
