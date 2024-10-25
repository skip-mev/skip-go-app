import { SwapWidget } from "widgetv2";

import DiscordButton from "@/components/DiscordButton";
import { LogoGo } from "@/components/LogoGo";
import { VersionCheck } from "@/components/VersionCheck";
import WidgetButton from "@/components/WidgetButton";
import { useURLQueryParams } from "@/hooks/useURLQueryParams";
import { cn } from "@/utils/ui";

import { apiURL, endpointOptions } from "@/lib/skip-go-widget";

export default function WidgetV2() {
  const defaultRoute = useURLQueryParams();
  return (
    <div
      className={cn(
        "bg-[#ff86ff] font-sans subpixel-antialiased",
        "relative overflow-x-hidden overflow-y-hidden",
        "before:fixed before:inset-x-0 before:bottom-0 before:h-[100vh] before:content-['']",
        "before:bg-[url(/widgetv2-bg.svg)] before:bg-cover before:bg-[center_top] before:bg-no-repeat",
      )}
    >
      <main className="relative flex min-h-screen flex-col items-center">
        <div className="flex h-20 w-full flex-row items-center justify-between px-6 py-4">
          <LogoGo color="white" />
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
              theme={{ brandColor: "#FF4FFF" }}
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
