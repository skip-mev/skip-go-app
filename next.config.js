/// <reference path="./env.d.ts" />
/// <reference path="./vercel.d.ts" />

const APP_URL =
  process.env.APP_URL ||
  (process.env.VERCEL && `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`) ||
  `${process.env.PROTOCOL || "http"}://${process.env.HOST || "localhost"}:${process.env.PORT || 3000}`;

/**
 * @type {import('next').NextConfig}
 * @see https://nextjs.org/docs/pages/api-reference/next-config-js
 */
let nextConfig = {
  env: {
    APP_URL,
  },
  eslint: {
    ignoreDuringBuilds: Boolean(process.env.VERCEL),
  },
  productionBrowserSourceMaps: true,
  rewrites: async () => [
    {
      source: "/.well-known/walletconnect.txt",
      destination: "/api/walletconnect/verify",
    },
    {
      source: "/api/rest/(.*)",
      destination: "/api/rest/handler",
    },
    {
      source: "/api/rpc/(.*)",
      destination: "/api/rpc/handler",
    },
    {
      source: "/api/skip/(.*)",
      destination: "/api/skip/handler",
    },
    {
      source: "/api/widget/skip/(.*)",
      destination: "/api/widget/skip/handler",
    },
  ],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && isServer) checkEnv();
    return config;
  },
};

module.exports = nextConfig;

function checkEnv() {
  if (checkEnv.once) return;

  const log = require("next/dist/build/output/log");

  if (!process.env.POLKACHU_USER || !process.env.POLKACHU_PASSWORD) {
    log.warn("env POLKACHU_USER or POLKACHU_PASSWORD is not set, will use public nodes");
  }

  checkEnv.once = true;
}
