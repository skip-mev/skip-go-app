/* eslint-disable @next/next/no-img-element */
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-[#FFDC61]">
        <img
          src="/site-bg-2.svg"
          className="fixed top-[200px] left-0 w-full h-full object-cover object-top pointer-events-none"
          alt=""
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
