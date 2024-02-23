import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";

import { Spinner } from "../Icons/Spinner";

export const Step = {
  SuccessState: () => (
    <div
      className="rounded bg-white"
      data-testid="state-success"
    >
      <CheckCircleIcon className="h-6 w-6 text-green-400" />
    </div>
  ),
  FailureState: () => (
    <div
      className="rounded bg-white"
      data-testid="state-failed"
    >
      <XCircleIcon className="h-6 w-6 text-red-400" />
    </div>
  ),
  LoadingState: () => (
    <div
      className="rounded-full border-2 bg-white p-1"
      data-testid="state-loading"
    >
      <Spinner className="h-4 w-4 text-[#FF486E]" />
    </div>
  ),
  DefaultState: () => (
    <div
      className="h-2 w-2 rounded-full bg-neutral-200"
      data-testid="state-idle"
    />
  ),
};
