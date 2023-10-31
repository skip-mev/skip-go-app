import { BigNumberish, formatUnits } from "ethers";
import { useMemo } from "react";

import { ChainIdOrName } from "@/chains";
import { useAssets } from "@/context/assets";
import { raise } from "@/utils/assert";

interface Props {
  chainId: ChainIdOrName;
  denom: string;
  value: BigNumberish;
}

export const AssetValue = ({ chainId, denom, value }: Props) => {
  const { getAsset } = useAssets();

  const { decimals, symbol } = useMemo(() => {
    return getAsset(denom, chainId) || raise(`No asset found for ${denom}`);
  }, [chainId, denom, getAsset]);

  return (
    <span className="tabular-nums">
      {formatUnits(value, decimals)} {symbol}
    </span>
  );
};
