"use client";

import { Fragment, useState } from "react";
import { useIBCTransfer } from "@/solve";
import { Chain } from "@/solve/api";
import NavBar from "@/components/NavBar";
import SolveForm from "@/components/SolveForm";

export default function Home() {
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);

  const signAndBroadcastIBCTransfer = useIBCTransfer();

  return (
    <Fragment>
      <NavBar chainID={selectedChain?.chainId} />
      <main className="px-4 pb-24">
        <div className="pb-16">
          <p className="text-center font-black text-xl tracking-wider">
            ibc<span className="text-indigo-500">.fun</span>
          </p>
        </div>
        <div className="w-full max-w-2xl mx-auto">
          <SolveForm
            onSourceChainChange={(newSourceChain) => {
              setSelectedChain(newSourceChain);
            }}
            onSubmit={signAndBroadcastIBCTransfer}
          />
        </div>
      </main>
    </Fragment>
  );
}
