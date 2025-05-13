import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
