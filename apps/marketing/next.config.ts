import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@ascenta/ui", "@ascenta/db", "@ascenta/email"],
};

export default nextConfig;
