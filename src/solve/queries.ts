import { AssetsRequest, SwapVenue, TransferState } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { useSkipClient } from "./hooks";

interface TransferSequence {
  srcChainID: string;
  destChainID: string;
  explorerLink: string | undefined;
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
        ...options,
      });
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
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
      ] as const,
    [amount, destinationAsset, destinationAssetChainID, direction, sourceAsset, sourceAssetChainID, swapVenue],
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
            }
          : {
              amountOut: amount,
              sourceAssetDenom: sourceAsset,
              sourceAssetChainID: sourceAssetChainID,
              destAssetDenom: destinationAsset,
              destAssetChainID: destinationAssetChainID,
              swapVenue,
            },
      );

      if (!route.operations) {
        throw new Error("No route found");
      }

      return route;
    },
    refetchInterval: refetchCount < 10 ? 1000 * 5 : false,
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
                explorerLink: transfer.ibcTransfer.packetTXs.sendTx?.explorerLink,
                state: transfer.ibcTransfer.state,
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

            return {
              srcChainID: transfer.axelarTransfer.srcChainID,
              destChainID: transfer.axelarTransfer.dstChainID,
              explorerLink: transfer.axelarTransfer.axelarScanLink,
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
      };
      setPrevData(resData);
      return resData;
    },
    enabled: !isSettled && !!txs && txs.length > 0 && enabled !== undefined ? enabled : true,
    refetchInterval: 1000 * 2,
    // to make the data persist when query key changed
    initialData: prevData,
  });
};
