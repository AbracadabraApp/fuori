import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The country pack this deployment serves (content/index.ts). Set COUNTRY in Railway.
  env: { NEXT_PUBLIC_COUNTRY: process.env.COUNTRY || process.env.NEXT_PUBLIC_COUNTRY || 'it' },
  // Type-check only the code that ships (tsconfig.build.json): a test script
  // can't break the production build, which Railway never rebuilds for tests/
  typescript: { tsconfigPath: 'tsconfig.build.json' },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
