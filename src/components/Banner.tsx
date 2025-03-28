export const Banner = () => {
  return (
    <div className="fixed bottom-0 flex w-full items-center justify-center p-0 sm:p-4">
      <div className="bg-white px-3 py-2.5 sm:rounded-xl sm:px-4 sm:py-3">
        <p className="text-xs/5 text-black sm:text-sm/6">
          <a
            href={process.env.NEXT_PUBLIC_BANNER_LINK}
            target="_blank"
          >
            <strong className="font-semibold">{process.env.NEXT_PUBLIC_BANNER_TITLE}</strong>
            <svg
              viewBox="0 0 2 2"
              aria-hidden="true"
              className="mx-2 inline size-0.5 fill-current"
            >
              <circle
                r={1}
                cx={1}
                cy={1}
              />
            </svg>
            {process.env.NEXT_PUBLIC_BANNER_MESSAGE}
          </a>
        </p>
      </div>
    </div>
  );
};
