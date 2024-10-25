import { defaultTheme, lightTheme, SwapWidget } from "widgetv2";

import DiscordButton from "@/components/DiscordButton";
import { LogoGo } from "@/components/LogoGo";
import { VersionCheck } from "@/components/VersionCheck";
import WidgetButton from "@/components/WidgetButton";
import { cn } from "@/utils/ui";

import { apiURL, endpointOptions } from "@/lib/skip-go-widget";
import { useEffect, useState } from "react";

export default function WidgetV2() {
  const [theme, setTheme] = useState<'light' | 'dark'>();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', event => {
        const newColorScheme = event.matches ? "light" : "dark";
        setTheme(newColorScheme);
        console.log(newColorScheme);
      });
    }
  }, []);
  return (
    <div
      className={cn(
        "font-sans subpixel-antialiased",
        "relative overflow-x-hidden overflow-y-hidden",
        "before:fixed before:inset-x-0 before:bottom-0 before:h-[100vh] before:content-['']",
        "before:bg-cover before:bg-[center_top] before:bg-no-repeat",
        theme === 'dark' ? 'before:bg-[url(/widgetv2-dark-bg.svg)]' : theme === 'light' ? 'before:bg-[url(/widgetv2-light-bg.svg)]' : ''
      )}
    >
      <main className="relative flex min-h-screen flex-col items-center">
        <div className="flex h-20 w-full flex-row items-center justify-between px-6 py-4">
          <LogoGo color={theme === "dark" ? 'white' : 'black'} />
          <div className="flex flex-row space-x-2">
            <WidgetButton />
            <DiscordButton />
          </div>
        </div>
        <div className="flex flex-grow flex-col items-center pt-16">
          <div
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-185px)',
            }}
          >
            <SwapWidget
              theme={theme === 'dark' ? defaultTheme : {
                ...lightTheme,
                brandColor: "#FF4FFF",
              }}
              endpointOptions={endpointOptions}
              apiURL={apiURL}
            />
          </div>
        </div>
      </main>
      <VersionCheck />
    </div>
  );
}