import { ReactNode, useEffect, useState } from "react";

export function ClientOnly({ children }: { children: ReactNode }) {
  const [state, setState] = useState(false);
  useEffect(() => setState(true), []);
  return state ? <>{children}</> : null;
}
