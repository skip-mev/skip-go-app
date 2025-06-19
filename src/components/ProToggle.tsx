import { SparklesIcon } from "@heroicons/react/24/solid";
import * as Switch from "@radix-ui/react-switch";

import { useProMode } from "@/contexts/ProModeContext";
import { cn } from "@/utils/ui";

export function ProToggle() {
  const { isProMode, toggleProMode, isLoaded } = useProMode();

  const handleToggle = (checked: boolean) => {
    toggleProMode();
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 animate-pulse bg-whiteA6 rounded"></div>
        <div className="w-11 h-6 animate-pulse bg-whiteA6 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="pro-mode"
        className="flex items-center gap-1.5 text-sm font-medium text-white/90 cursor-pointer"
      >
        <SparklesIcon className="h-4 w-4 text-violet11" />
        <span className="hidden sm:inline">Skip Pro</span>
      </label>
      <Switch.Root
        id="pro-mode"
        checked={isProMode}
        onCheckedChange={handleToggle}
        className={cn(
          "relative h-6 w-11 cursor-pointer rounded-full outline-none transition-all duration-200",
          "bg-whiteA6 data-[state=checked]:bg-violet9",
          "focus-visible:ring-2 focus-visible:ring-violet8 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        )}
      >
        <Switch.Thumb
          className={cn(
            "block h-5 w-5 rounded-full bg-white transition-transform duration-200",
            "translate-x-0.5 data-[state=checked]:translate-x-[22px]",
            "shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
          )}
        />
      </Switch.Root>
    </div>
  );
}
