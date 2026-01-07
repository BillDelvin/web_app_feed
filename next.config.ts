import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/", // The incoming path pattern
        destination: "/feed", // The path you want to redirect to
        permanent: false, // false for temporary redirect (HTTP 307), true for permanent (HTTP 308)
      },
    ];
  },
};

export default nextConfig;
