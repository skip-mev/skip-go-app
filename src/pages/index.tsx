import { SwapWidget } from "@/components/SwapWidget";
import { WalletModalProvider } from "@/components/WalletModal";
import { DefaultLayout } from "@/layouts/default";

export default function Home() {
  return (
    <DefaultLayout>
      <div className="flex flex-grow flex-col items-center">
        <div className="relative w-screen bg-white p-6 shadow-xl sm:max-w-[450px] sm:rounded-3xl">
          <WalletModalProvider>
            <SwapWidget />
          </WalletModalProvider>
        </div>
      </div>
    </DefaultLayout>
  );
}
