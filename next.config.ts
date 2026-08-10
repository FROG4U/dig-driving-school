import type { NextConfig } from "next";

// Defense-in-depth response headers applied to every route in production.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

// Areas no longer covered — 301 old location URLs to the homepage so old
// links and search-engine results don't hit a dead 404.
const removedLocations = ["cheltenham", "stroud", "tewkesbury", "swindon", "gloucestershire"];

const nextConfig: NextConfig = {
  // The production build on the server compiles via SWC and does not need the
  // TypeScript package (kept as a devDependency). We type-check locally before
  // every push, so skipping it here keeps the server build reliable regardless
  // of how npm install is invoked. (Next 16 no longer runs ESLint during build.)
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return removedLocations.map((loc) => ({
      source: `/locations/${loc}`,
      destination: "/",
      permanent: true,
    }));
  },
};

export default nextConfig;
