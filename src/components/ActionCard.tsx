/* eslint-disable @next/next/no-img-element */
import { FC, PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  accentColor: string;
  action: string;
  // imageStart: string;
  // imageEnd: string;
  // badgeImage: string;
  // badgeLabel: string;
}

const ActionCard: FC<Props> = ({
  accentColor,
  action,
  children,
  // imageStart,
  // imageEnd,
  // badgeImage,
  // badgeLabel,
}) => {
  return (
    <div className="border border-zinc-600 rounded-md w-full">
      <div
        className={`bg-${accentColor}-400/10 text-xs font-semibold text-${accentColor}-400 px-4 py-3 border-b border-zinc-600`}
      >
        <p>{action}</p>
      </div>
      <div className="px-4 py-8">
        {children}
        {/* <div className="relative">
          <div className="inset-0 absolute z-0 px-2 flex items-center">
            <div className="w-full h-0.5 border-b-2 border-zinc-600 border-t-0 border-dashed" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <img
              className="relative w-8 h-8 rounded-full"
              src={imageStart}
              alt=""
            />
            <div className="text-zinc-500 bg-zinc-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="inline-flex gap-3 items-center px-4 py-3 bg-zinc-800 rounded-md border border-zinc-700">
              <img className="w-8 h-8 rounded-full" src={badgeImage} alt="" />
              <p className="text-sm font-bold">{badgeLabel}</p>
            </div>
            <div className="text-zinc-500 bg-zinc-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <img className="w-8 h-8 rounded-full" src={imageEnd} alt="" />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ActionCard;
