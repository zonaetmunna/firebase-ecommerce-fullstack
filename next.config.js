/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["undici"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};
module.exports = nextConfig;
