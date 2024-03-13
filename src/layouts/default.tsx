import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import Header from "@/components/Header";
import { Help } from "@/components/Help";
import SkipBanner from "@/components/SkipBanner";
import { VersionCheck } from "@/components/VersionCheck";
import { AssetsProvider } from "@/context/assets";
import { SkipProvider } from "@/solve";

export function DefaultLayout({ children }: { children: ReactNode }) {
  return (
    <SkipProvider>
      <AssetsProvider>
        <main className="relative flex min-h-screen flex-col items-center sm:pt-11">
          <SkipBanner className="inset-x-0 top-0 z-50 w-screen sm:fixed" />
          <Header />
          {children}
        </main>
        <VersionCheck />
        <Help />
        <Toaster
          position="top-right"
          toastOptions={{ duration: 1000 * 10 }}
        />
      </AssetsProvider>
    </SkipProvider>
  );
}
