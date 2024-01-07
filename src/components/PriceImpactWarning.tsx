import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";

import { useDisclosureKey } from "@/context/disclosures";

interface Props {
  onGoBack: () => void;
  message?: string;
  title?: string;
}

export const PriceImpactWarning = ({
  onGoBack,
  message = "",
  title = "",
}: Props) => {
  const [isOpen, control] = useDisclosureKey("priceImpactWarning");

  if (!isOpen || title === "") return null;

  return (
    <div className="absolute inset-0 bg-white rounded-3xl p-6 overflow-y-auto scrollbar-hide flex flex-col">
      <div className="flex-grow pt-8">
        <div className="text-red-400 flex justify-center py-16">
          <ExclamationTriangleIcon className="h-24 w-24" />
        </div>
        <h3 className="font-bold text-lg text-center text-red-500 mb-2 tabular-nums">
          {title}
        </h3>
        <p className="text-center text-lg px-4 leading-snug text-neutral-500 tabular-nums">
          {message} Do you want to continue?
        </p>
      </div>
      <div className="flex items-end gap-2">
        <button
          className="border border-neutral-400 text-neutral-500 font-semibold py-4 rounded-lg w-full transition-colors hover:bg-neutral-100"
          onClick={() => control.close()}
        >
          Continue
        </button>
        <button
          className="bg-[#FF486E] hover:bg-[#ed1149] transition-colors text-white font-semibold py-4 rounded-lg w-full border border-transparent"
          onClick={() => {
            control.close();
            onGoBack();
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};
