import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function Home() {
  return (
    <div className="bg-white max-w-xl mx-auto shadow-xl rounded-3xl">
      <div className="p-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button className="hover:bg-neutral-100 inline-flex items-center gap-1 px-4 pr-2 py-1.5 rounded-md font-semibold transition-colors">
              <span>Osmosis</span>
              <ChevronDownIcon className="mt-0.5 h-4 w-4" />
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-400">
                AVAILABLE: <span className="text-neutral-700">100.00 OSMO</span>
              </p>
            </div>
            <button className="font-extrabold text-xs bg-neutral-400 hover:bg-neutral-500 text-white px-3 py-1 rounded-md transition-colors">
              MAX
            </button>
          </div>
          <div className="flex items-center">
            <button className="bg-neutral-200 hover:bg-neutral-300 inline-flex items-center text-sm font-semibold rounded-md w-[132px] text-left transition-colors">
              <div className="px-3 py-2">
                <img
                  alt="OSMO"
                  className="w-6 h-6"
                  src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/osmosis/asset/osmo.png"
                />
              </div>
              <span className="flex-1">OSMO</span>
              <div className="pr-2">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </button>
            <input
              className="flex-1 font-medium text-2xl px-4 py-4 focus:outline-none"
              placeholder="0.0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
