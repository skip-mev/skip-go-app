import { CubeIcon } from "@heroicons/react/20/solid";
import { useMemo } from "react";

import { useChainByID } from "@/api/queries";
import { ChainIdOrName } from "@/chains";
import { chainNameToChainlistURL } from "@/cosmos";

interface Props {
  chainId: ChainIdOrName;
}

export const ChainSymbol = ({ chainId }: Props) => {
  const { chain } = useChainByID(chainId);

  const src = useMemo(() => {
    if (!chain) return;
    return chainNameToChainlistURL(chain.chainName) + "/chainImg/_chainImg.svg";
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
