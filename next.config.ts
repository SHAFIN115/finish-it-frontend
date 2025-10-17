import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-ignore
    turbopack: false, // disables Turbopack
  } as any,
};

export default nextConfig;
