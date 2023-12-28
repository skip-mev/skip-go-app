import { useDisclosureKey } from "@/context/disclosures";

interface Props {
  onGoBack: () => void;
  warningMessage?: string;
}

export const PriceImpactWarning = ({
  onGoBack,
  warningMessage = "",
}: Props) => {
  const [isOpen, control] = useDisclosureKey("priceImpactWarning");

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-white rounded-3xl z-[999]">
      <div className="h-full px-4 py-6 overflow-y-auto scrollbar-hide">
        <div className="h-full flex flex-col">
          <div className="flex-1 pt-8">
            <div className="text-red-400 flex justify-center py-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-24 w-24"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="font-bold text-lg text-center text-red-500 mb-2">
              Price Impact Warning
            </p>
            <p className="text-center text-lg px-4 leading-snug text-gray-500">
              {warningMessage} Do you want to continue?
            </p>
          </div>
          <div className="flex items-end gap-2">
            <button
              className="bg-[#FF486E] hover:bg-[#ed1149] transition-colors text-white font-semibold py-4 rounded-md w-full"
              onClick={() => control.close()}
            >
              Continue
            </button>
            <button
              className="border border-gray-400 text-gray-500 font-semibold py-4 rounded-md w-full transition-colors hover:bg-gray-50"
              onClick={() => {
                control.close();
                onGoBack();
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
