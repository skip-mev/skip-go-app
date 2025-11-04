import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta
          content="ie=edge"
          httpEquiv="X-UA-Compatible"
        />
        {/* Setting X-UA-Compatible to IE=edge ensures the latest rendering engine is used */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
