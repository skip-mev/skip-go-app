/* eslint-disable @next/next/no-img-element */
import { FC, useState } from "react";
import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowPathRoundedSquareIcon,
} from "@heroicons/react/20/solid";
import { AnimatePresence, motion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";

const RouteEnd: FC<{
  amount: string;
  symbol: string;
  chain: string;
  logo: string;
}> = ({ amount, symbol, logo, chain }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-white w-14 h-14 border-2 border-neutral-200 p-1.5 rounded-full">
        <img className="w-full h-full" src={logo} alt="Osmosis Logo" />
      </div>
      <div className="font-semibold">
        <p>
          {amount} {symbol}
        </p>
        <p className="text-sm text-neutral-400">On {chain}</p>
      </div>
    </div>
  );
};

const RoutePreview: FC = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="px-4 py-6 h-full overflow-y-auto flex flex-col scrollbar-hide">
      <p className="text-xl font-semibold text-center mb-6">Route Preview</p>
      <div className="flex-1">
        <div className="relative">
          <div className="absolute w-14 inset-y-0 z-0 py-7 flex justify-center items-center">
            <div className="w-0.5 h-full bg-neutral-200"></div>
          </div>
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between pr-4">
              <RouteEnd
                amount="0.25"
                symbol="ATOM"
                logo="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/cosmos/asset/atom.png"
                chain="Neutron"
              />
              {isOpen && (
                <button
                  className="text-xs font-medium text-[#FF486E] hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Hide Details
                </button>
              )}
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.section
                  key="content"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { opacity: 1, height: "auto" },
                    collapsed: { opacity: 0, height: 0 },
                  }}
                  className="overflow-hidden"
                  // transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-14 flex items-center justify-center">
                      <div className="w-2 h-2 bg-neutral-200 rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">
                        Transfer{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/cosmos/asset/atom.png"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">ATOM</span>{" "}
                        from{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/neutron/chainImg/_chainImg.svg"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">
                          Neutron
                        </span>{" "}
                        to{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/cosmos/chainImg/_chainImg.svg"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">
                          Cosmos Hub
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-14 flex items-center justify-center">
                      <div className="w-2 h-2 bg-neutral-200 rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">
                        Transfer{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/cosmos/asset/atom.png"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">ATOM</span>{" "}
                        from{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/cosmos/chainImg/_chainImg.svg"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">
                          Cosmos Hub
                        </span>{" "}
                        to{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/osmosis/chainImg/_chainImg.svg"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">
                          Osmosis
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-14 flex items-center justify-center">
                      <div className="w-2 h-2 bg-neutral-200 rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">
                        Swap{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/cosmos/asset/atom.png"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">ATOM</span>{" "}
                        for{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/juno/asset/juno.png"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">Juno</span>{" "}
                        on{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/osmosis/chainImg/_chainImg.svg"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">
                          Osmosis
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-14 flex items-center justify-center">
                      <div className="w-2 h-2 bg-neutral-200 rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">
                        Transfer{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/juno/asset/juno.png"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">JUNO</span>{" "}
                        from{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/osmosis/chainImg/_chainImg.svg"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">
                          Osmosis
                        </span>{" "}
                        to{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/juno/chainImg/_chainImg.svg"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">Juno</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-14 flex items-center justify-center">
                      <div className="w-2 h-2 bg-neutral-200 rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">
                        Transfer{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/juno/asset/juno.png"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">JUNO</span>{" "}
                        from{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/juno/chainImg/_chainImg.svg"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">Juno</span>{" "}
                        to{" "}
                        <img
                          className="inline-block w-4 h-4 -mt-1"
                          src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/cosmos/chainImg/_chainImg.svg"
                          alt=""
                        />{" "}
                        <span className="font-semibold text-black">
                          Cosmos Hub
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
            {!isOpen && (
              <div className="w-14 flex items-center justify-center h-14">
                <button
                  className="bg-white text-neutral-400 border-2 border-neutral-200 rounded-full p-1 transition-transform hover:scale-110"
                  onClick={() => setOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            <RouteEnd
              amount="8.925504"
              symbol="JUNO"
              logo="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/juno/asset/juno.png"
              chain="Cosmos Hub"
            />
          </div>
        </div>
      </div>
      <div>
        <button
          className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform hover:scale-105 hover:rotate-1"
          onClick={() => {}}
        >
          Swap
        </button>
      </div>
      {/* <div className="p-4 flex flex-col h-[200px] justify-between relative">
        <div className="absolute w-[52px] top-4 bottom-4 left-4 flex items-center justify-center py-5 z-0">
          <div className="bg-neutral-200 w-0.5 h-full" />
        </div>
        <div className="flex items-center gap-2 relative">
          <div className="p-1 border-2 border-neutral-200 rounded-full inline-flex items-center justify-center bg-white">
            <img
              alt=""
              className="w-10 h-10"
              src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/osmosis/asset/osmo.png"
            />
          </div>
          <div>
            <p className="font-semibold">1.5 OSMO</p>
            <p className="font-semibold text-sm text-neutral-400">On Noble</p>
          </div>
        </div>
        <div className="pl-[12px] relative">
          <button className="bg-white text-neutral-400 border-2 border-neutral-200 rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 relative">
          <div className="p-1 border-2 border-neutral-200 rounded-full inline-flex items-center justify-center bg-white">
            <img
              alt=""
              className="w-10 h-10"
              src="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/osmosis/asset/osmo.png"
            />
          </div>
          <div>
            <p className="font-semibold">1.5 OSMO</p>
            <p className="font-semibold text-sm text-neutral-400">
              On Cosmos Hub
            </p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default RoutePreview;
