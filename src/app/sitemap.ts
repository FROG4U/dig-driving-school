import type { MetadataRoute } from "next";
import { cmsPages } from "@/lib/cms-pages";

const BASE_URL = "https://drivinginstructorgloucester.co.uk";

// Pages we don't want in Google's index (orphaned duplicate of /prices).
const EXCLUDE = new Set(["/lessons"]);

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
