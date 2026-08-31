import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

const BASE_URL = SITE.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dds"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
