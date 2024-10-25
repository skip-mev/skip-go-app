import { useQueryState } from "nuqs";

export const useURLQueryParams = () => {
  const [srcChainQP] = useQueryState("src_chain");
  const [srcAssetQP] = useQueryState("src_asset");
  const [destChainQP] = useQueryState("dest_chain");
  const [destAssetQP] = useQueryState("dest_asset");

  return {
    srcChainID: srcChainQP ?? undefined,
    srcAssetDenom: srcAssetQP ?? undefined,
    destChainID: destChainQP ?? undefined,
    destAssetDenom: destAssetQP ?? undefined,
  };
};
