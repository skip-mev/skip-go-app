import { SpinnerIcon } from "./SpinnerIcon";

export default function RouteLoadingBanner() {
  return (
    <div className="flex w-full items-center rounded-md bg-black p-3 text-left text-xs font-medium uppercase text-white/50">
      <p className="flex-1">Finding best route...</p>
      <SpinnerIcon className="inline-block h-4 w-4 animate-spin text-white" />
    </div>
  );
}
