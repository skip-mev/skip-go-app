import { useWallet, useWalletClient as useCosmosWalletClient } from "@cosmos-kit/react";
import { ComponentProps, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useConnect } from "wagmi";
import { create } from "zustand";

import { MergedWalletClient } from "@/lib/cosmos-kit";
import { isMobile } from "@/utils/os";

const useStore = create<Record<string, true>>(() => ({}));

export function useTotalWallets() {
  return useStore((state) => Object.keys(state).length);
}

type Props = ComponentProps<"div"> & {
  chainType: string;
  walletName: string;
};

export const WalletListItem = ({ children, chainType, walletName, ...props }: Props) => {
  const Component = useMemo(() => {
    return chainType === "cosmos" ? CosmosWalletListItem : EvmWalletListItem;
  }, [chainType]);
  return (
    <Component
      walletName={walletName}
      {...props}
    >
      {children}
    </Component>
  );
};

const CosmosWalletListItem = ({
  children,
  walletName,
  ...props
}: ComponentProps<"div"> & {
  walletName: string;
}) => {
  const { client } = useCosmosWalletClient(walletName);
  const { wallet } = useWallet(walletName);

  const walletClient = client as MergedWalletClient | undefined;
  const isWalletConnect = wallet?.mode === "wallet-connect";
  const _isMobile = isMobile();

  const show = useMemo(() => {
    if (!walletClient) return false;
    if ("snapInstalled" in walletClient) {
      return walletClient.snapInstalled;
    }
    if (_isMobile) {
      return isWalletConnect || walletClient;
    }
    if (!_isMobile) {
      return !isWalletConnect;
    }
    return true;
  }, [_isMobile, isWalletConnect, walletClient]);

  useEffect(() => {
    const unregister = () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      useStore.setState(({ [walletName]: _, ...latest }) => latest, true);
    };
    if (show) useStore.setState({ [walletName]: true });
    else unregister();
    return unregister;
  }, [show, walletName]);

  return <div {...props}>{show ? children : null}</div>;
};

const EvmWalletListItem = ({
  children,
  walletName,
  ...props
}: ComponentProps<"div"> & {
  walletName: string;
}) => {
  const { connectors } = useConnect({
    onError: (err) => {
      toast.error(
        <p>
          <strong>Failed to connect!</strong>
          <br />
          {err.name}: {err.message}
        </p>,
      );
    },
  });

  const connector = useMemo(() => {
    return connectors.find((c) => c.id === walletName);
  }, [connectors, walletName]);

  const show = useMemo(() => {
    return connector?.ready ?? false;
  }, [connector?.ready]);

  useEffect(() => {
    const unregister = () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      useStore.setState(({ [walletName]: _, ...latest }) => latest, true);
    };
    if (show) useStore.setState({ [walletName]: true });
    else unregister();
    return unregister;
  }, [show, walletName]);

  return <div {...props}>{show ? children : null}</div>;
};
