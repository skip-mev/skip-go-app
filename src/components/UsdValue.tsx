import { ReactNode } from "react";

import { Args, useUsdValue } from "@/hooks/useUsdValue";

type Props = Args & { loading?: ReactNode };

export const UsdValue = ({ loading = "...", ...args }: Props) => {
  const { data: usdValue = 0, isLoading } = useUsdValue(args);
  return <>{isLoading ? loading : `$${usdValue}`}</>;
};
