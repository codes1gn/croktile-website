import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isGhPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGhPages ? "export" : "standalone",
  ...(isGhPages && {
    basePath: "/croktile-website",
    images: { unoptimized: true },
    trailingSlash: true,
  }),
};

export default withNextIntl(nextConfig);
