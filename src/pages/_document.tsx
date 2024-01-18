import { clsx } from "clsx";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html
      lang="en"
      className="bg-[#ffdc61]"
    >
      <Head>
        <meta charSet="UTF-8" />
        <meta
          content="ie=edge"
          httpEquiv="X-UA-Compatible"
        />
      </Head>
      <body
        className={clsx(
          "font-sans subpixel-antialiased",
          "relative overflow-x-hidden overflow-y-scroll",
          "before:fixed before:inset-x-0 before:bottom-0 before:h-[80vh] before:content-['']",
          "before:bg-[url(/site-bg-2.svg)] before:bg-cover before:bg-[center_top] before:bg-no-repeat",
        )}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
