import { CubeIcon } from "@heroicons/react/20/solid";

import { useChainByID } from "@/api/queries";
import { ChainIdOrName } from "@/chains";

interface Props {
  chainId: ChainIdOrName;
}

export const ChainSymbol = ({ chainId }: Props) => {
  const { chain } = useChainByID(chainId);

  const src = chain?.logoURI;
  const alt = chain?.prettyName || "UNKNOWN";

  const Icon = src ? "img" : CubeIcon;
  const iconProps = src ? { src, alt } : {};

  return (
    <div className="flex items-center space-x-1">
      <Icon className="w-4 h-4" {...iconProps} />
      <span className="font-semibold">{alt}</span>
    </div>
  );
};
