import va from "@vercel/analytics";
import { Route } from "./components/TransactionDialog";

export function trackRoute(route: Route) {
  va.track("transaction", {
    type: route.actionType,
    amount: parseFloat(route.amountIn),
    asset: route.sourceAsset.symbol,
  });
}
