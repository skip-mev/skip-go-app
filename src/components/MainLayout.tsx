"use client";

import { FC, PropsWithChildren } from "react";

import BetaBanner from "./BetaBanner";
import NavBar from "./NavBar";
import SkipBanner from "./SkipBanner";

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="h-screen overflow-y-auto relative">
      <SkipBanner />
      <NavBar />
      <main className="px-4 pt-4 pb-24">
        <div className="w-full max-w-screen-xl mx-auto">{children}</div>
      </main>
      <div className="fixed left-0 bottom-0 lg:bottom-auto lg:top-11 flex items-center p-6 max-w-[400px] z-[999]">
        <BetaBanner />
      </div>
    </div>
  );
};

export default MainLayout;
