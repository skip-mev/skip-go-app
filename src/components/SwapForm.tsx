import { FC, useCallback, useMemo } from "react";
import { Chain } from "@/solve/api";
import ChainSelect from "./ChainSelect";
import { useChainAssets, useSolveChains, useSwapRoute } from "@/solve/queries";
import AssetSelect, { Asset } from "./AssetSelect";
import { useAssetBalances, useChainByID } from "@/utils/utils";
import { WalletStatus } from "@cosmos-kit/core";
import { ethers } from "ethers";

export interface SwapFormValues {
  sourceChain?: Chain;
  destinationChain?: Chain;
  sourceAsset?: Asset;
  destinationAsset?: Asset;
  amountIn: string;
}

interface Props {
  onChange: (values: SwapFormValues) => void;
  values: SwapFormValues;
}

const SwapForm: FC<Props> = ({ onChange, values }) => {
  const { data: supportedChains } = useSolveChains();

  const {
    status: walletStatus,
    connect: connectWallet,
    address,
  } = useChainByID(values.sourceChain?.chainId ?? "cosmoshub-4");

  const { data: sourceChainAssets } = useChainAssets(
    values.sourceChain?.chainName
  );

  const { data: destinationChainAssets } = useChainAssets(
    values.destinationChain?.chainName
  );

  const balances = useAssetBalances(
    sourceChainAssets ?? [],
    values.sourceChain?.chainId
  );

  const selectedAssetBalance = useMemo(() => {
    if (!balances || !values.sourceAsset) {
      return "0";
    }

    return balances[values.sourceAsset.denom] ?? "0";
  }, [balances, values.sourceAsset]);

  // const onSubmit = useCallback(() => {}, []);

  if (
    !values.sourceChain ||
    !values.destinationChain ||
    !values.sourceAsset ||
    !values.destinationAsset ||
    !supportedChains ||
    !sourceChainAssets ||
    !destinationChainAssets
  ) {
    return null;
  }

  return (
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
                  sourceAsset: undefined,
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
                  destinationAsset: undefined,
                });
              }}
            />
          </div>
        </div>
        <div>
          <div className="bg-zinc-800 p-4 pb-8 rounded-md">
            <p className="font-semibold text-sm mb-3">Asset</p>
            <div className="border border-zinc-600 rounded-md p-4 space-y-4">
              <div className="sm:flex items-center">
                <div className="sm:w-48">
                  <AssetSelect
                    asset={values.sourceAsset}
                    assets={sourceChainAssets ?? []}
                    balances={balances ?? {}}
                    onSelect={(value) => {
                      onChange({ ...values, sourceAsset: value });
                    }}
                  />
                </div>
                <div className="flex-1">
                  <input
                    className="bg-transparent font-bold text-xl p-4 placeholder:text-zinc-500 w-full outline-none"
                    type="text"
                    placeholder="0.000"
                    value={values.amountIn}
                    onChange={(e) =>
                      onChange({ ...values, amountIn: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  <span className="text-zinc-400">Amount Available:</span>{" "}
                  <span className="font-medium">
                    {ethers.formatUnits(
                      selectedAssetBalance,
                      values.sourceAsset?.decimals
                    )}
                  </span>
                </p>
                <button
                  className="font-bold text-sm text-indigo-500 hover:text-indigo-400 active:text-indigo-500"
                  onClick={() => {
                    onChange({
                      ...values,
                      amountIn: ethers.formatUnits(
                        selectedAssetBalance,
                        values.sourceAsset?.decimals
                      ),
                    });
                  }}
                >
                  MAX
                </button>
              </div>
            </div>
          </div>
          <div className="h-3 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                className="bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-800 border-8 border-zinc-900 rounded-full p-3 transition-colors"
                onClick={() => {
                  onChange({
                    ...values,
                    sourceChain: values.destinationChain,
                    destinationChain: values.sourceChain,
                    sourceAsset: values.destinationAsset,
                    destinationAsset: values.sourceAsset,
                  });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="bg-zinc-800 p-4 pt-8 rounded-md">
            <div className="border border-zinc-600 rounded-md p-4 space-y-4">
              <div className="sm:flex items-center">
                <div className="sm:w-48">
                  <AssetSelect
                    asset={values.destinationAsset}
                    assets={destinationChainAssets ?? []}
                    balances={{}}
                    onSelect={(value) => {
                      onChange({
                        ...values,
                        destinationAsset: value,
                      });
                    }}
                  />
                </div>
                <div className="flex-1">
                  <span className="bg-transparent font-bold text-xl p-4 placeholder:text-zinc-500 w-full outline-none">
                    {/* {values.destinationAsset &&
                      swapRouteResponse &&
                      ethers.formatUnits(
                        swapRouteResponse.userSwapAmountOut,
                        values.destinationAsset.decimals
                      )} */}
                  </span>
                </div>
              </div>
            </div>
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
          // onClick={onSubmit}
          // disabled={isButtonDisabled}
        >
          Swap
          {/* {!txPending && <span>Transfer {values.asset?.symbol}</span>} */}
          {/* {txPending && (
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
            )} */}
        </button>
      )}
    </div>
  );
};

export default SwapForm;
