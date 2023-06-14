import { FC, Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { IBCHop } from "@/solve/api";
import ChainSelect from "./ChainSelect";
import AssetSelect, { Asset } from "./AssetSelect";
import { useChainByID } from "@/utils/utils";
import {
  DeliverTxResponse,
  GasPrice,
  SigningStargateClient,
  StargateClient,
} from "@cosmjs/stargate";
import { ethers } from "ethers";
import {
  ChainRecord,
  ExtendedHttpEndpoint,
  WalletStatus,
  getFastestEndpoint,
} from "@cosmos-kit/core";
import PathDisplay from "./PathDisplay";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { useChainAssets, useSolveChains, useSolveRoute } from "@/solve/queries";
import { Chain, IBCAddress, getTransferMsgs } from "@/solve/api";
import { useManager } from "@cosmos-kit/react";
import Long from "long";
import { Disclosure } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getBalances(address: string, client: StargateClient) {
  const response = await client.getAllBalances(address);

  return response;
}

function useAssetBalance(
  address: string,
  denom: string,
  getClient: () => Promise<StargateClient>
) {
  return useQuery({
    queryKey: ["assetBalance", address, denom, getClient],
    queryFn: async () => {
      const client = await getClient();

      const balance = await client.getBalance(address, denom);

      console.log(balance);

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

  const { address, getStargateClient } = useChainByID(chainID ?? "cosmoshub-4");

  useEffect(() => {
    if (assets.length > 0 && address) {
      (async () => {
        const client = await getStargateClient();
        const balances = await getBalances(address, client);

        const balancesMap = balances.reduce((acc, coin) => {
          acc[coin.denom] = coin.amount;

          return acc;
        }, {} as Record<string, string>);

        setAssetBalances(balancesMap);
      })();
    }
  }, [assets, address, getStargateClient]);

  return assetBalances;
}

const DEFAULT_SOURCE_CHAIN_ID = "osmosis-1";
const DEFAULT_DESTINATION_CHAIN_ID = "cosmoshub-4";

interface Props {
  onSourceChainChange?: (chain: Chain) => void;
}

const SolveForm: FC<Props> = ({ onSourceChainChange = () => {} }) => {
  const [sourceChain, setSourceChain] = useState<Chain | null>(null);
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [txPending, setTxPending] = useState(false);
  const [displaySuccessMessage, setDisplaySuccessMessage] = useState(false);
  const [destinationDenomOverride, setDestinationDenomOverride] = useState("");

  const { data: assets } = useChainAssets(sourceChain?.chainName);

  const { data: supportedChains } = useSolveChains();

  const { data: solveRoute, status: solveRouteStatus } = useSolveRoute(
    selectedAsset?.denom ?? "",
    sourceChain?.chainId ?? "",
    destinationDenomOverride,
    destinationChain?.chainId ?? ""
  );

  const routeChainIDs = useMemo(() => {
    if (!sourceChain || !destinationChain) {
      return [];
    }

    if (!solveRoute || solveRoute.length === 0) {
      return [sourceChain.chainId, destinationChain.chainId];
    }

    const IDs = solveRoute.map((hop) => hop.chainId);

    if (destinationChain) {
      IDs.push(destinationChain.chainId);
    }

    return IDs;
  }, [sourceChain, destinationChain, solveRoute]);

  const balances = useAssetBalances(assets ?? [], sourceChain?.chainId);

  // const selectedAssetBalance = useMemo(() => {
  //   if (selectedAsset) {
  //     return balances[selectedAsset.denom] ?? "0";
  //   }

  //   return "0";
  // }, [selectedAsset, balances]);

  const {
    status: walletStatus,
    connect: connectWallet,
    getOfflineSignerDirect,
    getSigningStargateClient,
    address,
    getRpcEndpoint,
    getStargateClient,
  } = useChainByID(sourceChain?.chainId ?? "cosmoshub-4");

  const { data: selectedAssetBalance } = useAssetBalance(
    address ?? "",
    selectedAsset?.denom ?? "",
    getStargateClient
  );

  const { chainRecords } = useManager();

  useEffect(() => {
    if (!sourceChain && supportedChains) {
      const _sourceChain =
        supportedChains.find(
          (chain) => chain.chainId === DEFAULT_SOURCE_CHAIN_ID
        ) ?? supportedChains[0];
      setSourceChain(_sourceChain);
      onSourceChainChange(_sourceChain);
    }

    if (!destinationChain && supportedChains) {
      setDestinationChain(
        supportedChains.find(
          (chain) => chain.chainId === DEFAULT_DESTINATION_CHAIN_ID
        ) ?? supportedChains[0]
      );
    }
  }, [destinationChain, onSourceChainChange, sourceChain, supportedChains]);

  useEffect(() => {
    if (assets && assets.length > 0) {
      setSelectedAsset(assets[0]);
    }
  }, [assets]);

  const transferAssets = useCallback(async () => {
    if (
      !selectedAsset ||
      !sourceChain ||
      !destinationChain ||
      !solveRoute ||
      solveRoute.length === 0 ||
      !window.keplr
    ) {
      return;
    }

    setTxPending(true);

    try {
      const formattedAmount = ethers.parseUnits(
        transferAmount,
        selectedAsset.decimals
      );

      const chainInfos = await window.keplr.getChainInfosWithoutEndpoints();

      // console.log(chainInfos);

      for (const chainID of routeChainIDs) {
        if (chainInfos.findIndex((chain) => chain.chainId === chainID) == -1) {
          const record = chainRecords.find(
            (record) => record.chain.chain_id === chainID
          );

          if (record) {
            const chainInfo = await axios.get(
              `https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/cosmos/${record.name}.json`
            );

            await window.keplr.experimentalSuggestChain(chainInfo.data);
          }
        }
      }

      // make sure all wallets are connected
      await window.keplr.enable(routeChainIDs);

      const userAddresses: IBCAddress[] = [];

      for (const chainID of routeChainIDs) {
        const signer = window.keplr.getOfflineSigner(chainID);
        const accounts = await signer.getAccounts();

        userAddresses.push({
          address: accounts[0].address,
          chainId: chainID,
        });
      }

      const messages = await getTransferMsgs(
        formattedAmount.toString(),
        {
          denom: selectedAsset.denom,
          chainId: sourceChain.chainId,
        },
        destinationChain.chainId,
        solveRoute,
        userAddresses
      );

      if (messages.length === 0) {
        throw new Error("No transfer messages");
      }

      // if (messages.length > 1) {
      //   throw new Error("Too many messages");
      // }

      for (let i = 0; i < messages.length; i++) {
        const multiHopMsg = messages[i];

        console.log(`tx ${i + 1} of ${messages.length}`);

        const decodedMsg = JSON.parse(multiHopMsg.msg);

        const denomIn: string = decodedMsg.token.denom;
        const denomOut: string =
          i === messages.length - 1
            ? solveRoute[solveRoute.length - 1].destDenom
            : JSON.parse(messages[i + 1].msg).token.denom;

        const originChainRecord = chainRecords.find(
          (record) => multiHopMsg.chainId === record.chain.chain_id
        ) as ChainRecord;

        if (
          !originChainRecord.preferredEndpoints ||
          !originChainRecord.preferredEndpoints.rpc
        ) {
          throw new Error("No preferred endpoints");
        }

        const destinationChainRecord = chainRecords.find(
          (record) =>
            multiHopMsg.path[multiHopMsg.path.length - 1] ===
            record.chain.chain_id
        ) as ChainRecord;

        if (
          !destinationChainRecord.preferredEndpoints ||
          !destinationChainRecord.preferredEndpoints.rpc
        ) {
          throw new Error("No preferred endpoints");
        }

        const destinationChainEndpoint = await getFastestEndpoint(
          destinationChainRecord.preferredEndpoints.rpc
        );

        const destinationChainClient = await StargateClient.connect(
          destinationChainEndpoint
        );
        const destinationChainAddress =
          userAddresses.find(
            (address) =>
              address.chainId === multiHopMsg.path[multiHopMsg.path.length - 1]
          )?.address ?? "";

        const destinationChainBalanceBefore =
          await destinationChainClient.getBalance(
            destinationChainAddress,
            denomOut
          );

        if (!window.keplr) {
          throw new Error("Keplr not installed");
        }

        const signer = window.keplr.getOfflineSigner(multiHopMsg.chainId);

        const endpoint = await getFastestEndpoint(
          originChainRecord.preferredEndpoints.rpc
        );

        const feeInfo = originChainRecord.chain.fees?.fee_tokens[0];

        if (!feeInfo) {
          throw new Error("No fee info");
        }

        const client = await SigningStargateClient.connectWithSigner(
          endpoint,
          signer,
          {
            gasPrice: GasPrice.fromString(
              `${feeInfo.average_gas_price}${feeInfo.denom}`
            ),
          }
        );

        const currentHeight = await client.getHeight();

        const msg = {
          typeUrl: multiHopMsg.msgTypeUrl,
          value: {
            sender: decodedMsg.sender,
            receiver: decodedMsg.receiver,
            sourceChannel: decodedMsg.source_channel,
            sourcePort: decodedMsg.source_port,
            token: decodedMsg.token,
            timeoutHeight: {
              revisionHeight: Long.fromNumber(currentHeight).add(100),
              revisionNumber: Long.fromNumber(currentHeight).add(100),
            },
            timeoutTimestamp: Long.fromNumber(0),
            memo: decodedMsg.memo,
          },
        };

        console.log(msg);

        await client.signAndBroadcast(decodedMsg.sender, [msg], "auto");

        while (true) {
          console.log("polling...");

          const balance = await destinationChainClient.getBalance(
            destinationChainAddress,
            denomOut
          );
          if (
            parseInt(balance.amount) >
            parseInt(destinationChainBalanceBefore.amount)
          ) {
            break;
          }
          await wait(1000);
        }
      }

      // for (const multiHopMsg of messages) {

      setDisplaySuccessMessage(true);
      // }
    } catch (err) {
      console.log(err);
    } finally {
      setTxPending(false);
      await wait(5000);
      setDisplaySuccessMessage(false);
    }
  }, [
    chainRecords,
    destinationChain,
    routeChainIDs,
    selectedAsset,
    solveRoute,
    sourceChain,
    transferAmount,
  ]);

  const isButtonDisabled = useMemo(() => {
    if (solveRouteStatus !== "success") {
      return true;
    }

    if (txPending) {
      return true;
    }

    return false;
  }, [solveRouteStatus, txPending]);

  if (!sourceChain || !destinationChain || !supportedChains || !assets) {
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
                chain={sourceChain}
                chains={supportedChains}
                onSelect={(value) => {
                  setSourceChain(value);
                  onSourceChainChange(value);
                }}
              />
            </div>
            <div className="bg-zinc-800 p-4 rounded-t-md md:rounded-md">
              <p className="font-semibold text-sm mb-3">Destination Chain</p>
              <ChainSelect
                chain={destinationChain}
                chains={supportedChains}
                onSelect={(value) => {
                  setDestinationChain(value);
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
                    {selectedAsset && assets.length > 0 && (
                      <AssetSelect
                        asset={selectedAsset}
                        assets={assets}
                        balances={balances}
                        onSelect={setSelectedAsset}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      className="bg-transparent font-bold text-xl p-4 placeholder:text-zinc-500 w-full outline-none"
                      type="text"
                      placeholder="0.000"
                      onChange={(e) => setTransferAmount(e.target.value)}
                      value={transferAmount}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="text-zinc-400">Amount Available:</span>{" "}
                    <span className="font-medium">
                      {ethers.formatUnits(
                        selectedAssetBalance ?? "0",
                        selectedAsset?.decimals
                      )}
                    </span>
                  </p>
                  <button
                    className="font-bold text-sm text-indigo-500 hover:text-indigo-400 active:text-indigo-500"
                    onClick={() => {
                      setTransferAmount(
                        ethers.formatUnits(
                          selectedAssetBalance ?? "0",
                          selectedAsset?.decimals ?? 0
                        )
                      );
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
                      onClick={() => setDestinationDenomOverride("")}
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
                          setDestinationDenomOverride(e.target.value)
                        }
                        value={destinationDenomOverride}
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
            onClick={transferAssets}
            disabled={isButtonDisabled}
          >
            {solveRouteStatus === "loading" && <span>Loading...</span>}
            {solveRouteStatus === "error" && <span>No Route found</span>}
            {solveRouteStatus === "success" && !txPending && (
              <span>Transfer {selectedAsset?.symbol}</span>
            )}
            {solveRouteStatus === "success" && txPending && (
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
        {/* <div className="border border-zinc-700 rounded-lg p-6 py-6">
          <div className="pb-4">
            <p className="font-bold">IBC Transfer Route</p>
          </div>
          <PathDisplay
            chainIDs={routeChainIDs}
            loading={solveRouteStatus === "loading"}
            noPathExists={
              solveRouteStatus === "error" ||
              (solveRouteStatus === "success" && solveRoute?.length === 0)
            }
          />
        </div> */}
      </div>
      {displaySuccessMessage && (
        <div
          aria-live="assertive"
          className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
        >
          <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
            {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
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
