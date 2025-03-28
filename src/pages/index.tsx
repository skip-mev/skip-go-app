import { CosmosPage } from "@/components/pages/cosmos";
import { SkipPage } from "@/components/pages/skip";

const isCosmosDomain = process.env.COSMOS_DOMAIN === "true";

export default function Home() {
  if (isCosmosDomain) {
    return <CosmosPage />;
  }
  return <SkipPage />;
}
