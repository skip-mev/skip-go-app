/* eslint-disable @next/next/no-img-element */
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
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
