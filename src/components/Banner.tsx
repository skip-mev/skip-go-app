export const Banner = () => {
  const link = process.env.NEXT_PUBLIC_BANNER_LINK;
  const message = process.env.NEXT_PUBLIC_BANNER_MESSAGE;
  const content = (
    <>
      <span className="truncate text-[14px] font-semibold leading-5 tracking-[-0.01em] md:shrink-0 md:overflow-visible md:text-[15px]">
        {process.env.NEXT_PUBLIC_BANNER_TITLE}
      </span>
      <span className="hidden min-w-0 truncate text-[13px] leading-5 text-white/75 md:block">{message}</span>
    </>
  );
  const lineClass = "flex min-w-0 max-w-full items-baseline justify-center gap-3";

  return (
    <div
      role="status"
      className="relative flex w-full justify-center bg-black px-4 py-3 font-diatype text-white md:px-6"
    >
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          title={message}
          className={`${lineClass} text-white underline decoration-white/60 underline-offset-[3px] hover:decoration-white`}
        >
          {content}
        </a>
      ) : (
        <div
          title={message}
          className={lineClass}
        >
          {content}
        </div>
      )}
    </div>
  );
};
