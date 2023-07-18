/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  rewrites: async () => {
    return [
      {
        source: "/nodes/:chainID/:path*",
        destination: "/api/proxy",
      },
    ];
  },
};

module.exports = nextConfig;
