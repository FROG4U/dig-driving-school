import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

interface SeoDefaults {
  title: string;
  description: string;
}

/**
 * Returns Next.js Metadata for a page slug, using DB-stored SEO data when available,
 * falling back to the provided defaults.
 */
export async function getPageMetadata(slug: string, defaults: SeoDefaults): Promise<Metadata> {
  let dbSeo: { metaTitle?: string | null; metaDesc?: string | null } | null = null;

  try {
    dbSeo = await prisma.pageSeo.findUnique({ where: { slug } });
  } catch {
    // DB not available - use defaults
  }

  const title = dbSeo?.metaTitle || defaults.title;
  const description = dbSeo?.metaDesc || defaults.description;

  return {
    title,
    description,
    // Tell Google which URL is the canonical one for this page, so www and
    // non-www (and any ?utm= variants) consolidate instead of competing.
    alternates: { canonical: slug === "/" ? "/" : slug },
    openGraph: {
      title,
      description,
      type: "website",
      url: slug === "/" ? "/" : slug,
    },
  };
}
