import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.join(process.cwd()),
  },
};

export default nextConfig;

if (process.env.OPENNEXT_CLOUDFLARE_DEV === "1") {
  const loadCloudflareDev = new Function(
    "specifier",
    "return import(specifier)",
  ) as (specifier: string) => Promise<{
    initOpenNextCloudflareForDev: () => void;
  }>;

  loadCloudflareDev("@opennextjs/cloudflare")
    .then((module) => module.initOpenNextCloudflareForDev())
    .catch(() => {
      console.warn(
        "OPENNEXT_CLOUDFLARE_DEV is enabled, but @opennextjs/cloudflare is not installed.",
      );
    });
}
