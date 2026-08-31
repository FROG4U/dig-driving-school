import { prisma } from "@/lib/prisma";

/** Editable banner/hero fields shared by every page. */
export interface BannerData {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  imageUrl?: string;
  /** Darkness of the tint laid over the background image, 0–90 (%). */
  overlay?: number;
}

/**
 * Generic section content loader. Returns the DB-stored fields merged over the
 * provided fallback, or the fallback itself when nothing is saved / DB is down.
 */
export async function getSection<T extends object>(
  slug: string,
  sectionKey: string,
  fallback: T
): Promise<T> {
  try {
    const rec = await prisma.pageSection.findUnique({
      where: { slug_sectionKey: { slug, sectionKey } },
    });
    if (!rec || !rec.enabled) return fallback;
    return { ...fallback, ...(JSON.parse(rec.data) as Partial<T>) };
  } catch {
    return fallback;
  }
}

/**
 * Convenience wrapper for the "banner" section every page has.
 *
 * The hero heading is the page's <h1>, so its precedence is:
 *   1. a heading typed into Admin -> Content for this page (explicit wins)
 *   2. the H1 set in Admin -> Pages -> Edit SEO, so that field really is the
 *      page's <h1> rather than a note that renders nowhere
 *   3. the built-in default in cms-pages.ts
 */
export async function getBanner(slug: string, fallback: BannerData): Promise<BannerData> {
  let cms: Partial<BannerData> = {};
  let seoH1: string | null = null;

  try {
    const [rec, seo] = await Promise.all([
      prisma.pageSection.findUnique({ where: { slug_sectionKey: { slug, sectionKey: "banner" } } }),
      prisma.pageSeo.findUnique({ where: { slug } }),
    ]);
    if (rec?.enabled) {
      try {
        cms = JSON.parse(rec.data) as Partial<BannerData>;
      } catch {
        cms = {};
      }
    }
    seoH1 = seo?.h1?.trim() || null;
  } catch {
    // DB not available - fall back to the built-in content below.
  }

  const banner: BannerData = { ...fallback, ...cms };
  if (!cms.heading?.trim() && seoH1) banner.heading = seoH1;
  return banner;
}

/**
 * CSS `background` value for a hero. When a banner image is set, a layered navy
 * tint sits over it: a vertical darken for overall legibility plus a stronger
 * left-to-right fade so the (left-aligned) heading stays readable while the
 * photo still shows through on the right. Otherwise the page gradient is used.
 */
export function bannerBg(data: BannerData, fallbackGradient: string): string {
  if (!data.imageUrl) return fallbackGradient;
  const o = Math.min(90, Math.max(0, data.overlay ?? 55)) / 100;
  const top = (o * 0.82).toFixed(2);
  const bottom = Math.min(0.92, o + 0.14).toFixed(2);
  const vertical = `linear-gradient(180deg, rgba(7,13,24,${top}) 0%, rgba(7,13,24,${bottom}) 100%)`;
  const side = `linear-gradient(90deg, rgba(7,13,24,0.82) 0%, rgba(7,13,24,0.34) 55%, rgba(7,13,24,0.10) 100%)`;
  return `${vertical}, ${side}, url("${data.imageUrl}")`;
}
