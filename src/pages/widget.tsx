import { useLayoutEffect } from "react";

import { defaultValues, useSwapWidgetStore } from "@/components/SwapWidget/useSwapWidget";
import { Widget } from "@/widget";

export default function WidgetPage() {
  useLayoutEffect(() => {
    useSwapWidgetStore.setState(defaultValues);
  }, []);
  return (
    <div className="relative bg-white p-6 scrollbar-hide">
      <Widget />
    </div>
  );
}
