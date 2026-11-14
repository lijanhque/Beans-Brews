import type { NextConfig } from "next";

const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "").split(","),
].filter((origin): origin is string => Boolean(origin?.trim()));

const serverActionAllowedOrigins = [
  ...new Set(
    trustedOrigins.map((origin) => {
      const url = new URL(origin.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error(`Unsupported trusted origin protocol: ${url.protocol}`);
      }
      return url.host;
    }),
  ),
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      allowedOrigins: serverActionAllowedOrigins,
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
