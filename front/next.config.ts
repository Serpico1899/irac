import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "550mb", // Increase limit to 50MB for large database uploads
    },
  },
  eslint: {
    // Temporarily disable strict rules for initial setup
    ignoreDuringBuilds: false,
    dirs: ["src"],
  },
  typescript: {
    // Temporarily ignore TypeScript errors during builds for initial setup
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(nextConfig);
