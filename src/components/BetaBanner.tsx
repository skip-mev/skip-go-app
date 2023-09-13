import { FC, useState } from "react";

const BetaBanner: FC = () => {
  const [shouldShow, setShouldShow] = useState(false);

  if (shouldShow === false) {
    return null;
  }

  return (
    <div className="bg-indigo-400 text-white rounded-lg p-4 shadow-lg">
      <div className="flex gap-4 items-center justify-between pb-2">
        <p className="font-bold">Important</p>
        <button
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            localStorage.setItem("IBC_DOT_FUN_SHOW_BETA_BANNER", false);
            setShouldShow(false);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
      <p>
        ibc.fun is a beta product. We are actively working on improving the
        reliability and responsiveness, please use with caution.
      </p>
    </div>
  );
};

export default BetaBanner;
