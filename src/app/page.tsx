"use client";

import { Fragment, useState } from "react";
import { Chain } from "@/solve/api";
import NavBar from "@/components/NavBar";
import SolveForm from "@/components/SolveForm";
import Card from "@/components/Card";
import ActionCard from "@/components/ActionCard";
import PathDisplay from "@/components/PathDisplay";

export default function Home() {
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);

  return (
    <Fragment>
      <NavBar chainID={selectedChain?.chainId} />
      <main className="px-4 pb-24">
        <div className="w-full max-w-screen-xl mx-auto">
          <div className="flex gap-6">
            <div className="w-full max-w-xl">
              <SolveForm
                onSourceChainChange={(newSourceChain) => {
                  setSelectedChain(newSourceChain);
                }}
              />
            </div>
            <div className="flex-1">
              <Card>
                <div className="space-y-6">
                  <p className="text-sm font-semibold text-zinc-300">
                    Transfering axlUSDC from Osmosis to Cosmos Hub requires{" "}
                    <span className="font-bold text-emerald-500">2</span>{" "}
                    transactions:
                  </p>
                  {/* <ActionCard
                    accentColor="indigo"
                    action="Transfer from Osmosis to Axelar"
                  >
                    <PathDisplay
                      chainIDs={["osmosis-1", "axelar-dojo-1"]}
                      asset={{
                        denom:
                          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
                        symbol: "axlUSDC",
                        decimals: 6,
                        image: "ethereum/asset/usdc.png",
                      }}
                    />
                  </ActionCard> */}
                  <ActionCard
                    accentColor="indigo"
                    action="Transfer from Axelar to Cosmos Hub"
                  >
                    <PathDisplay
                      chainIDs={[
                        "osmosis-1",
                        "axelar-dojo-1",
                        "osmosis-1",
                        "cosmoshub-4",
                      ]}
                      asset={{
                        denom:
                          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
                        symbol: "axlUSDC",
                        decimals: 6,
                        image: "ethereum/asset/usdc.png",
                      }}
                    />
                  </ActionCard>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </Fragment>
  );
}
