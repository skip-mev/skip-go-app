import { clsx } from "clsx";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="bg-[#ffdc61]">
      <Head>
        <meta charSet="UTF-8" />
        <meta content="ie=edge" httpEquiv="X-UA-Compatible" />
      </Head>
      <body
        className={clsx(
          "subpixel-antialiased font-sans",
          "overflow-x-hidden overflow-y-scroll relative",
          "before:fixed before:bottom-0 before:inset-x-0 before:h-[80vh] before:content-['']",
          "before:bg-[url(/site-bg-2.svg)] before:bg-[center_top] before:bg-no-repeat before:bg-cover",
        )}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
