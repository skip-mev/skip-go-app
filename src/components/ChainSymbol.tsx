import { CubeIcon } from "@heroicons/react/20/solid";
import { useMemo } from "react";

import { ChainId } from "@/chains/types";
import { useChainByID } from "@/hooks/useChains";

interface Props {
  chainId: ChainId;
}

export const ChainSymbol = ({ chainId }: Props) => {
  const { data: chain } = useChainByID(chainId);

  const src = useMemo(() => {
    if (!chain) return;
    return chain.logoURI;
  }, [chain]);

  const alt = chain?.prettyName || chain?.chainName || "UNKNOWN";

  const Icon = src ? "img" : CubeIcon;
  const iconProps = src ? { src, alt } : {};

  return (
    <div className="flex items-center space-x-1">
      <Icon className="w-4 h-4" {...iconProps} />
      <span className="font-semibold">{alt}</span>
    </div>
  );
};
