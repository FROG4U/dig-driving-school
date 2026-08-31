import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";
import { cmsPages } from "@/lib/cms-pages";

const BASE_URL = SITE.url;

// Pages we don't want in Google's index. /lessons used to sit here as an
// "orphaned duplicate of /prices", but it is linked from the main navigation
// and has its own content and SEO, so leaving it out just hid a real page.
const EXCLUDE = new Set<string>([]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return cmsPages
    .filter((p) => !EXCLUDE.has(p.slug))
    .map((p) => ({
      url: `${BASE_URL}${p.slug === "/" ? "" : p.slug}`,
      lastModified: now,
      changeFrequency: p.slug === "/" ? "weekly" : "monthly",
      priority: p.slug === "/" ? 1 : p.type === "Location" ? 0.8 : 0.7,
    }));
}
