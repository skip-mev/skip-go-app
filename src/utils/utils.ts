import { useChain, useManager } from "@cosmos-kit/react";
import { useRef, useEffect } from "react";

export function formatAddress(address: string, prefix: string) {
  return address.slice(0, prefix.length + 2) + "..." + address.slice(-4);
}

// helper method to get the chain name from the chain ID and return the corresponding chain record.
export function useChainByID(chainID: string) {
  const { chainRecords } = useManager();

  const chainRecord =
    chainRecords.find((record) => record.chain.chain_id === chainID) ??
    chainRecords[0];

  return useChain(chainRecord.name);
}

export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    if (delay !== null) {
      const id = setTimeout(tick, delay);

      return () => clearTimeout(id);
    }
  }, [delay]);
}
