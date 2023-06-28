import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log("!!!");
  const { searchParams, pathname } = new URL(request.url);

  const chainID = pathname.split("/")[2];
  const rest = pathname.split(chainID)[1];

  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("Authorization", "Basic c2tpcDpwMDFrYWNodT8h");

  // Extract product id from pathname
  request.nextUrl.href = `https://${chainID}-skip-rpc.polkachu.com/${rest}?${searchParams.toString()}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/nodes/:chainID/:path*",
};
