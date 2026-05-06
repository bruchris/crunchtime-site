import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: projectRoot
  },
  async redirects() {
    return [
      { source: "/consulting", destination: "/no/services", permanent: true },
      {
        source: "/:locale(no|en)/consulting",
        destination: "/:locale/services",
        permanent: true
      },
      { source: "/contact", destination: "/no/contact", permanent: true }
    ];
  }
};

export default withNextIntl(nextConfig);
