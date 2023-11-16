import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { Args, useUsdDiffValue, useUsdValue } from "@/hooks/useUsdValue";

type UsdValueProps = Args & {
  loading?: ReactNode;
  context?: "src" | "dest";
};

export const UsdValue = ({
  loading = "...",
  context,
  ...args
}: UsdValueProps) => {
  const { data: usdValue = 0, isLoading } = useUsdValue(args);

  const ctx = useContext(diffCtx);
  useEffect(() => {
    if (!(ctx && context)) return;
    if (context === "src") {
      ctx.setSrc(args);
    } else {
      ctx.setDest(args);
    }
  }, [args, context, ctx]);

  return <>{isLoading ? loading : `$${usdValue.toFixed(2)}`}</>;
};

type Context = {
  src?: Args;
  dest?: Args;
  setSrc: (args: Args) => void;
  setDest: (args: Args) => void;
  reset: () => void;
};

const diffCtx = createContext<Context>({
  setSrc: () => {},
  setDest: () => {},
  reset: () => {},
});

type UsdDiffValueProps = {
  src: Args;
  dest: Args;
  loading?: ReactNode;
  children?: (args: { isLoading: boolean; percentage: number }) => ReactNode;
};

export const UsdDiffValue = ({
  src,
  dest,
  loading = "...",
  children,
}: UsdDiffValueProps) => {
  const { data: percentage = 0, isLoading } = useUsdDiffValue([src, dest]);
  if (children) return <>{children({ isLoading, percentage })}</>;
  if (isLoading) return <>{loading}</>;
  return <>{percentage.toFixed(2)}%</>;
};

export const UsdDiff = {
  Provider: ({ children }: { children: ReactNode }) => {
    const [src, setSrc] = useState<Args>();
    const [dest, setDest] = useState<Args>();
    const reset = () => (setSrc(undefined), setDest(undefined));
    return (
      <diffCtx.Provider value={{ src, dest, setSrc, setDest, reset }}>
        {children}
      </diffCtx.Provider>
    );
  },
  Value: (props: Omit<UsdDiffValueProps, "src" | "dest">) => {
    const ctx = useContext(diffCtx);
    if (!(ctx?.src && ctx?.dest)) return null;
    return <UsdDiffValue src={ctx.src} dest={ctx.dest} {...props} />;
  },
};

export const useUsdDiffReset = () => {
  const ctx = useContext(diffCtx);
  return ctx?.reset || (() => {});
};
