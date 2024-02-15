import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";

import { Spinner } from "../common/Spinner";

export const Step = {
  SuccessState: () => (
    <div className="rounded bg-white">
      <CheckCircleIcon className="h-6 w-6 text-green-400" />
    </div>
  ),
  FailureState: () => (
    <div className="rounded bg-white">
      <XCircleIcon className="h-6 w-6 text-red-400" />
    </div>
  ),
  LoadingState: () => (
    <div className="rounded-full border-2 bg-white p-1">
      <Spinner className="h-4 w-4 text-[#FF486E]" />
    </div>
  ),
  DefaultState: () => <div className="h-2 w-2 rounded-full bg-neutral-200" />,
};
