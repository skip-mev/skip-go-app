import { BigNumberish, formatUnits } from "ethers";
import { useMemo } from "react";

import { ChainId } from "@/chains/types";
import { useAssets } from "@/context/assets";
import { raise } from "@/utils/assert";

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
    v = format(parseFloat(v));
    return v;
  }, [decimals, value]);

  return (
    <span className="tabular-nums">
      {formattedValue} {symbol}
    </span>
  );
};

const { format } = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
