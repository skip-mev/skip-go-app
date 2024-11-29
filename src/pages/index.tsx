import { useMemo } from "react";
import { defaultTheme, lightTheme, Widget } from "widgetv2";

import DiscordButton from "@/components/DiscordButton";
import { LogoGo } from "@/components/LogoGo";
import WidgetButton from "@/components/WidgetButton";
import { useFeatureEnabled } from "@/hooks/useFeatureEnabled";
import { useTheme } from "@/hooks/useTheme";
import { useURLQueryParams } from "@/hooks/useURLQueryParams";
import { apiURL, endpointOptions } from "@/lib/skip-go-widget";
import { isMobile } from "@/utils/os";
import { cn } from "@/utils/ui";

export default function Home() {
  const defaultRoute = useURLQueryParams();
  const goFast = useFeatureEnabled("goFastEnabled");
  const theme = useTheme();
  const mobile = useMemo(() => isMobile(), []);

  if (!theme) return null;
  return (
    <div
      className={cn(
        "bg-[#191919] font-sans subpixel-antialiased",
        "relative overflow-x-hidden overflow-y-hidden",
        "before:fixed before:inset-x-0 before:bottom-0 before:h-[100vh] before:content-['']",
        "before:bg-cover before:bg-[center_top] before:bg-no-repeat",
        theme === "dark"
          ? "before:bg-[url(/widgetv2-dark-bg.svg)]"
          : theme === "light"
            ? "before:bg-[url(/widgetv2-light-bg.svg)]"
            : "",
      )}
    >
      <main className="relative flex min-h-screen flex-col items-center">
        <div className="flex h-20 w-full flex-row items-center justify-between px-6 py-4">
          <LogoGo color={theme === "dark" ? "white" : "black"} />
          <div className="flex flex-row space-x-2">
            <WidgetButton />
            <DiscordButton />
          </div>
        </div>
        <div className="flex flex-grow flex-col items-center pt-16">
          <div
            style={{
              position: "absolute",
              top: "50%",
              transform: "translateY(-185px)",
              width: "100%",
              maxWidth: "500px",
              padding: "0 10px",
            }}
          >
            <Widget
              theme={theme === "dark" ? defaultTheme : lightTheme}
              endpointOptions={endpointOptions}
              apiUrl={apiURL}
              defaultRoute={defaultRoute}
              routeConfig={{
                goFast,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
