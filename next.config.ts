import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allow dev requests from other origins (e.g. local network IP)
  // add any origins you use for testing like http://192.168.100.9:3001
  // see: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  allowedDevOrigins: [
    "http://192.168.100.9:3001",
    "http://192.168.100.9",
    "http://localhost:3001",
    'local-origin.dev', '*.local-origin.dev',
    "192.168.1.40"
  ],
};

export default nextConfig;
