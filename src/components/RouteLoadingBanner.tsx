import { SpinnerIcon } from "./SpinnerIcon";

export default function RouteLoadingBanner() {
  return (
    <div className="bg-black text-white/50 font-medium uppercase text-xs p-3 rounded-md flex items-center w-full text-left">
      <p className="flex-1">Finding best route...</p>
      <SpinnerIcon className="animate-spin h-4 w-4 inline-block text-white" />
    </div>
  );
}
