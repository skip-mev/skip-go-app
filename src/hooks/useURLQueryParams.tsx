import { useQueryState } from "nuqs";
import { useMemo } from "react";

export const useURLQueryParams = () => {
  const [srcChainQP] = useQueryState("src_chain");
  const [srcAssetQP] = useQueryState("src_asset");
  const [destChainQP] = useQueryState("dest_chain");
  const [destAssetQP] = useQueryState("dest_asset");
  const [amountInQP] = useQueryState("amount_in");
  const [amountOutQP] = useQueryState("amount_out");

  const queryParams = useMemo(() => {
    return {
      srcChainId: srcChainQP ?? undefined,
      srcAssetDenom: srcAssetQP ?? undefined,
      destChainId: destChainQP ?? undefined,
      destAssetDenom: destAssetQP ?? undefined,
      amountIn: amountInQP ? Number(amountInQP) : undefined,
      amountOut: amountOutQP ? Number(amountOutQP) : undefined,
    };
  }, [amountInQP, amountOutQP, destAssetQP, destChainQP, srcAssetQP, srcChainQP]);

  if (!srcChainQP && !srcAssetQP && !destChainQP && !destAssetQP && !amountInQP && !amountOutQP) {
    return;
  }

  return queryParams;
};
