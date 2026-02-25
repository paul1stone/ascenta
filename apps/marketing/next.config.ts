import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@ascenta/ui", "@ascenta/db", "@ascenta/email"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
