import type { MetadataRoute } from "next";

const BASE_URL = "https://digdrivingschool.co.uk";

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
