import { AssetsRequest, ChainTransaction, StatusState, SwapVenue, TransferState } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { useExperimentalFeatures } from "@/hooks/useExperimentalFeatures";

import { useSkipClient } from "./hooks";

interface TransferSequence {
  srcChainID: string;
  destChainID: string;
  txs: {
    sendTx: ChainTransaction | null;
    receiveTx: ChainTransaction | null;
  };
  state: TransferState;
}

export function useAssets(options: AssetsRequest = {}) {
  const skipClient = useSkipClient();

  const queryKey = useMemo(() => ["solve-assets", options] as const, [options]);

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, options] }) => {
      return skipClient.assets({
        includeEvmAssets: true,
        includeCW20Assets: true,
        includeSvmAssets: true,
        ...options,
      });
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    select: (assets) => {
      return Object.fromEntries(
        Object.entries(assets).map(([chainID, chainAssets]) => {
          return [
            chainID,
            chainAssets.filter((asset) => {
              return !(asset.denom === "solana-devnet-native" || asset.denom === "solana-native");
            }),
          ];
        }),
      );
    },
  });
}

interface UseRouteArgs {
  direction: "swap-in" | "swap-out";
  amount: string;
  sourceAsset?: string;
  sourceAssetChainID?: string;
  destinationAsset?: string;
  destinationAssetChainID?: string;
  enabled?: boolean;
  swapVenue?: SwapVenue;
}

export function useRoute({
  direction,
  amount,
  sourceAsset,
  sourceAssetChainID,
  destinationAsset,
  destinationAssetChainID,
  enabled,
  swapVenue,
}: UseRouteArgs) {
  const skipClient = useSkipClient();

  const [refetchCount, setRefetchCount] = useState(0);

  const { data: experimentalFeatures } = useExperimentalFeatures();

  const queryKey = useMemo(
    () =>
      [
        "solve-route",
        direction,
        amount,
        sourceAsset,
        destinationAsset,
        sourceAssetChainID,
        destinationAssetChainID,
        swapVenue,
        experimentalFeatures,
      ] as const,
    [
      amount,
      destinationAsset,
      destinationAssetChainID,
      direction,
      sourceAsset,
      sourceAssetChainID,
      swapVenue,
      experimentalFeatures,
    ],
  );

  const query = useQuery({
    queryKey,
    queryFn: async ({
      queryKey: [
        ,
        direction,
        amount,
        sourceAsset,
        destinationAsset,
        sourceAssetChainID,
        destinationAssetChainID,
        swapVenue,
        experimentalFeatures,
      ],
    }) => {
      if (!sourceAsset || !sourceAssetChainID || !destinationAsset || !destinationAssetChainID) {
        return;
      }

      const route = await skipClient.route(
        direction === "swap-in"
          ? {
              amountIn: amount,
              sourceAssetDenom: sourceAsset,
              sourceAssetChainID: sourceAssetChainID,
              destAssetDenom: destinationAsset,
              destAssetChainID: destinationAssetChainID,
              swapVenue,
              allowMultiTx: true,
              allowUnsafe: true,
              experimentalFeatures,
              smartRelay: true,
            }
          : {
              amountOut: amount,
              sourceAssetDenom: sourceAsset,
              sourceAssetChainID: sourceAssetChainID,
              destAssetDenom: destinationAsset,
              destAssetChainID: destinationAssetChainID,
              swapVenue,
              allowMultiTx: true,
              allowUnsafe: true,
              experimentalFeatures,
              smartRelay: true,
            },
      );

      if (!route.operations) {
        throw new Error("No route found");
      }

      return route;
    },
    refetchInterval: refetchCount < 10 ? 1000 * 10 : false,
    retry: false,
    enabled:
      enabled &&
      !!sourceAsset &&
      !!destinationAsset &&
      !!sourceAssetChainID &&
      !!destinationAssetChainID &&
      amount !== "0",
  });

  useEffect(() => {
    if (query.isRefetching) {
      setRefetchCount((count) => count + 1);
    }
  }, [query.isRefetching]);

  useEffect(() => {
    setRefetchCount(0);
  }, [queryKey]);

  return query;
}

export const useBroadcastedTxsStatus = ({
  txs,
  txsRequired,
  enabled,
}: {
  txsRequired: number;
  txs: { chainID: string; txHash: string }[] | undefined;
  enabled?: boolean;
}) => {
  const skipClient = useSkipClient();
  const [isSettled, setIsSettled] = useState(false);
  const [prevData, setPrevData] = useState<
    | {
        isSuccess: boolean;
        isSettled: boolean;
        transferSequence: TransferSequence[];
        states: StatusState[];
      }
    | undefined
  >(undefined);

  const queryKey = useMemo(() => ["solve-txs-status", txsRequired, txs] as const, [txs, txsRequired]);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, txsRequired, txs] }) => {
      if (!txs) return;
      const result = await Promise.all(
        txs.map(async (tx) => {
          const _res = await skipClient.transactionStatus({
            chainID: tx.chainID,
            txHash: tx.txHash,
          });

          const cleanTransferSequence = _res.transferSequence.map((transfer) => {
            if ("ibcTransfer" in transfer) {
              return {
                srcChainID: transfer.ibcTransfer.srcChainID,
                destChainID: transfer.ibcTransfer.dstChainID,
                txs: {
                  sendTx: transfer.ibcTransfer.packetTXs.sendTx,
                  receiveTx: transfer.ibcTransfer.packetTXs.receiveTx,
                },
                state: transfer.ibcTransfer.state,
              };
            }
            if ("cctpTransfer" in transfer) {
              const cctpState: TransferState = (() => {
                switch (transfer.cctpTransfer.state) {
                  case "CCTP_TRANSFER_SENT":
                    return "TRANSFER_PENDING";
                  case "CCTP_TRANSFER_PENDING_CONFIRMATION":
                    return "TRANSFER_PENDING";
                  case "CCTP_TRANSFER_CONFIRMED":
                    return "TRANSFER_PENDING";
                  case "CCTP_TRANSFER_RECEIVED":
                    return "TRANSFER_SUCCESS";
                  default:
                    return "TRANSFER_UNKNOWN";
                }
              })();
              return {
                srcChainID: transfer.cctpTransfer.dstChainID,
                destChainID: transfer.cctpTransfer.dstChainID,
                txs: {
                  sendTx: transfer.cctpTransfer.txs.sendTx,
                  receiveTx: transfer.cctpTransfer.txs.receiveTx,
                },
                state: cctpState,
              };
            }
            if ("hyperlaneTransfer" in transfer) {
              const hyperlaneState: TransferState = (() => {
                switch (transfer.hyperlaneTransfer.state) {
                  case "HYPERLANE_TRANSFER_SENT":
                    return "TRANSFER_PENDING";
                  case "HYPERLANE_TRANSFER_FAILED":
                    return "TRANSFER_FAILURE";
                  case "HYPERLANE_TRANSFER_RECEIVED":
                    return "TRANSFER_SUCCESS";
                  case "HYPERLANE_TRANSFER_UNKNOWN":
                    return "TRANSFER_UNKNOWN";
                  default:
                    return "TRANSFER_UNKNOWN";
                }
              })();
              return {
                srcChainID: transfer.hyperlaneTransfer.fromChainID,
                destChainID: transfer.hyperlaneTransfer.toChainID,
                txs: {
                  sendTx: transfer.hyperlaneTransfer.txs.sendTx,
                  receiveTx: transfer.hyperlaneTransfer.txs.receiveTx,
                },
                state: hyperlaneState,
              };
            }
            const axelarState: TransferState = (() => {
              switch (transfer.axelarTransfer.state) {
                case "AXELAR_TRANSFER_PENDING_RECEIPT":
                  return "TRANSFER_PENDING";
                case "AXELAR_TRANSFER_PENDING_CONFIRMATION":
                  return "TRANSFER_PENDING";
                case "AXELAR_TRANSFER_FAILURE":
                  return "TRANSFER_FAILURE";
                case "AXELAR_TRANSFER_SUCCESS":
                  return "TRANSFER_SUCCESS";
                default:
                  return "TRANSFER_UNKNOWN";
              }
            })();
            if ("contractCallWithTokenTxs" in transfer.axelarTransfer.txs) {
              return {
                srcChainID: transfer.axelarTransfer.srcChainID,
                destChainID: transfer.axelarTransfer.dstChainID,
                txs: {
                  sendTx: transfer.axelarTransfer.txs.contractCallWithTokenTxs.sendTx,
                  receiveTx: transfer.axelarTransfer.txs.contractCallWithTokenTxs.executeTx,
                },
                state: axelarState,
              };
            }
            return {
              srcChainID: transfer.axelarTransfer.srcChainID,
              destChainID: transfer.axelarTransfer.dstChainID,
              txs: {
                sendTx: transfer.axelarTransfer.txs.sendTokenTxs.sendTx,
                receiveTx: transfer.axelarTransfer.txs.sendTokenTxs.executeTx,
              },
              state: axelarState,
            };
          });

          return {
            state: _res.state,
            transferSequence: cleanTransferSequence,
          };
        }),
      );
      const _isSettled = result.every((tx) => {
        return (
          tx.state === "STATE_COMPLETED_SUCCESS" ||
          tx.state === "STATE_COMPLETED_ERROR" ||
          tx.state === "STATE_ABANDONED"
        );
      });

      const _isSuccess = result.every((tx) => {
        return tx.state === "STATE_COMPLETED_SUCCESS";
      });

      if (result.length > 0 && txsRequired === result.length && _isSettled) {
        setIsSettled(true);
      }

      const mergedTransferSequence = result.reduce<TransferSequence[]>((acc, tx) => {
        return acc.concat(...tx.transferSequence);
      }, []);

      const resData = {
        isSuccess: _isSuccess,
        isSettled: _isSettled,
        transferSequence: mergedTransferSequence,
        states: result.map((tx) => tx.state),
      };
      setPrevData(resData);
      return resData;
    },
    enabled: !isSettled && (!!txs && txs.length > 0 && enabled !== undefined ? enabled : true),
    refetchInterval: 1000 * 2,
    // to make the data persist when query key changed
    initialData: prevData,
  });
};
