import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// The only change is on this line, using the '@' alias
const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "550mb",
    },
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ["src"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(nextConfig);
