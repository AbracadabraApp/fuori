import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The country pack this deployment serves (content/index.ts). Set COUNTRY in Railway.
  env: { NEXT_PUBLIC_COUNTRY: process.env.COUNTRY || process.env.NEXT_PUBLIC_COUNTRY || 'it' },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
