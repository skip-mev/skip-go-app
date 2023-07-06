import { FC } from "react";

const SkipBanner: FC = () => {
  return (
    <div className="bg-[#FF486E] font-semibold text-sm text-white py-2">
      <div className="flex items-center justify-between gap-2 px-4 max-w-screen-lg mx-auto">
        <p>Powered by the Skip API </p>
        <a
          className="bg-indigo-400 px-2 py-1 pr-1 rounded inline-flex items-center gap-1 hover:underline"
          href="https://skip.money/docs/frontends"
          target="_blank"
          rel="noreferrer"
        >
          <span>Learn More</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default SkipBanner;
