import { BigNumberish, formatUnits } from "ethers";
import { useMemo } from "react";

import { ChainId } from "@/chains/types";
import { useAssets } from "@/context/assets";
import { raise } from "@/utils/assert";
import { formatMaxFraction } from "@/utils/intl";

interface Props {
  chainId: ChainId;
  denom: string;
  value: BigNumberish;
}

export const AssetValue = ({ chainId, denom, value }: Props) => {
  const { getAsset } = useAssets();

  const { decimals, symbol } = useMemo(() => {
    return getAsset(denom, chainId) || raise(`No asset found for ${denom}`);
  }, [chainId, denom, getAsset]);

  const formattedValue = useMemo(() => {
    let v = formatUnits(value, decimals);
    v = formatMaxFraction(parseFloat(v), 2);
    return v;
  }, [decimals, value]);

  return (
    <span className="tabular-nums">
      {formattedValue} {symbol}
    </span>
  );
};
