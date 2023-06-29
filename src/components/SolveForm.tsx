import { FC, Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { IBCHop } from "@/solve/api";
import ChainSelect from "./ChainSelect";
import AssetSelect, { Asset } from "./AssetSelect";
import { getStargateClientForChainID, useChainByID } from "@/utils/utils";
import { StargateClient } from "@cosmjs/stargate";
import { ethers } from "ethers";
import { WalletStatus } from "@cosmos-kit/core";
import { useChainAssets, useSolveChains } from "@/solve/queries";
import { Chain } from "@/solve/api";
import { useManager } from "@cosmos-kit/react";
import { Disclosure } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getBalances(address: string, client: StargateClient) {
  const response = await client.getAllBalances(address);

  return response;
}

function useAssetBalance(address: string, denom: string, chainID: string) {
  return useQuery({
    queryKey: ["assetBalance", address, denom, chainID],
    queryFn: async () => {
      const client = await getStargateClientForChainID(chainID);

      const balance = await client.getBalance(address, denom);

      return balance.amount;
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: !!address && !!denom,
  });
}

function useAssetBalances(assets: Asset[], chainID?: string) {
  const [assetBalances, setAssetBalances] = useState<Record<string, string>>(
    {}
  );

  const { address } = useChainByID(chainID ?? "cosmoshub-4");

  useEffect(() => {
    if (assets.length > 0 && address) {
      (async () => {
        const client = await getStargateClientForChainID(
          chainID ?? "cosmoshub-4"
        );
        const balances = await getBalances(address, client);

        const balancesMap = balances.reduce((acc, coin) => {
          acc[coin.denom] = coin.amount;

          return acc;
        }, {} as Record<string, string>);

        setAssetBalances(balancesMap);
      })();
    }
  }, [assets, address, chainID]);

  return assetBalances;
}

export const DEFAULT_SOURCE_CHAIN_ID = "osmosis-1";
export const DEFAULT_DESTINATION_CHAIN_ID = "cosmoshub-4";

export interface SolveFormValues {
  sourceChain?: Chain;
  destinationChain?: Chain;
  asset?: Asset;
  amount: string;
  destinationAssetOverride: string;
}

interface Props {
  onChange: (values: SolveFormValues) => void;
  values: SolveFormValues;
  onSubmit: () => void;
  txPending?: boolean;
}

const SolveForm: FC<Props> = ({ onChange, values, onSubmit, txPending }) => {
  const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);

  const { data: assets } = useChainAssets(values.sourceChain?.chainName);

  const { data: supportedChains } = useSolveChains();

  const balances = useAssetBalances(assets ?? [], values.sourceChain?.chainId);

  const selectedAssetBalance = useMemo(() => {
    if (values.asset) {
      return balances[values.asset.denom] ?? "0";
    }

    return "0";
  }, [values.asset, balances]);

  const {
    status: walletStatus,
    connect: connectWallet,
    address,
  } = useChainByID(values.sourceChain?.chainId ?? "cosmoshub-4");

  // const { data: selectedAssetBalance } = useAssetBalance(
  //   address ?? "",
  //   values.asset?.denom ?? "",
  //   values.sourceChain?.chainId ?? "cosmoshub-4"
  // );

  const { chainRecords } = useManager();

  const isButtonDisabled = useMemo(() => {
    // if (solveRouteStatus !== "success") {
    //   return true;
    // }

    if (txPending) {
      return true;
    }

    return false;
  }, [txPending]);

  if (
    !values.sourceChain ||
    !values.destinationChain ||
    !supportedChains ||
    !assets
  ) {
    return null;
  }

  return (
    <Fragment>
      <div className="space-y-4">
        <div className="px-4 py-6 border border-zinc-700 rounded-lg space-y-8">
          <div className="md:grid grid-cols-2 gap-4">
            <div className="bg-zinc-800 p-4 rounded-t-md md:rounded-md">
              <p className="font-semibold text-sm mb-3">Source Chain</p>
              <ChainSelect
                chain={values.sourceChain}
                chains={supportedChains}
                onSelect={(value) => {
                  onChange({
                    ...values,
                    sourceChain: value,
                    asset: undefined,
                  });
                }}
              />
            </div>
            <div className="bg-zinc-800 p-4 rounded-t-md md:rounded-md">
              <p className="font-semibold text-sm mb-3">Destination Chain</p>
              <ChainSelect
                chain={values.destinationChain}
                chains={supportedChains}
                onSelect={(value) => {
                  onChange({
                    ...values,
                    destinationChain: value,
                  });
                }}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-zinc-800 p-4 rounded-md">
              <p className="font-semibold text-sm mb-3">Asset</p>
              <div className="border border-zinc-600 rounded-md p-4 space-y-4">
                <div className="sm:flex items-center">
                  <div className="sm:w-48">
                    {values.asset && assets.length > 0 && (
                      <AssetSelect
                        asset={values.asset}
                        assets={assets}
                        balances={balances}
                        onSelect={(value) => {
                          onChange({
                            ...values,
                            asset: value,
                          });
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      className="bg-transparent font-bold text-xl p-4 placeholder:text-zinc-500 w-full outline-none"
                      type="text"
                      placeholder="0.000"
                      onChange={(e) =>
                        onChange({ ...values, amount: e.target.value })
                      }
                      value={values.amount}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="text-zinc-400">Amount Available:</span>{" "}
                    <span className="font-medium">
                      {ethers.formatUnits(
                        selectedAssetBalance ?? "0",
                        values.asset?.decimals
                      )}
                    </span>
                  </p>
                  <button
                    className="font-bold text-sm text-indigo-500 hover:text-indigo-400 active:text-indigo-500"
                    onClick={() => {
                      onChange({
                        ...values,
                        amount: ethers.formatUnits(
                          selectedAssetBalance ?? "0",
                          values.asset?.decimals ?? 0
                        ),
                      });
                    }}
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>
            <div>
              <Disclosure>
                {({ open }) => (
                  <Fragment>
                    <Disclosure.Button
                      className="text-gray-300 text-sm font-semibold flex items-center justify-between gap-2 hover:underline"
                      onClick={() =>
                        onChange({ ...values, destinationAssetOverride: "" })
                      }
                    >
                      <span>Specify Destination Denom</span>
                      <span>
                        {open ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </span>
                    </Disclosure.Button>
                    <Disclosure.Panel className="pt-4">
                      <input
                        className="p-4 rounded-lg w-full bg-zinc-800/50 focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none"
                        type="text"
                        placeholder="ibc/..."
                        onChange={(e) =>
                          onChange({
                            ...values,
                            destinationAssetOverride: e.target.value,
                          })
                        }
                        value={values.destinationAssetOverride}
                      />
                    </Disclosure.Panel>
                  </Fragment>
                )}
              </Disclosure>
            </div>
          </div>
        </div>
        {walletStatus === WalletStatus.Disconnected && (
          <button
            className="bg-indigo-600 hover:bg-indigo-500/90 active:bg-indigo-600 text-white focus-visible:outline-indigo-600 w-full rounded-md px-6 py-2.5 h-16 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
        {walletStatus === WalletStatus.Connected && (
          <button
            className="bg-indigo-600 hover:bg-indigo-500/90 active:bg-indigo-600 disabled:bg-indigo-500 disabled:opacity-70 disabled:pointer-events-none text-white focus-visible:outline-indigo-600 w-full rounded-md px-6 py-2.5 h-16 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors text-center whitespace-nowrap truncate"
            onClick={onSubmit}
            disabled={isButtonDisabled}
          >
            {/* {solveRouteStatus === "loading" && <span>Loading...</span>} */}
            {/* {solveRouteStatus === "error" && <span>No Route found</span>} */}
            {/* {solveRouteStatus === "success" && !txPending && ( */}
            {!txPending && <span>Transfer {values.asset?.symbol}</span>}
            {/* )} */}
            {txPending && (
              <div className="text-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 inline-block text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
          </button>
        )}
      </div>
      {displaySuccessMessage && (
        <div
          aria-live="assertive"
          className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
        >
          <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 text-emerald-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Transfer Successful
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default SolveForm;
