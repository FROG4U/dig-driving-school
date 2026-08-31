import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { fromSlugParam } from "@/lib/slug";
import { SITE } from "@/lib/site-config";

// ─── Page configs ──────────────────────────────────────────────────────────
type PageConfig = {
  name: string;
  location?: string;
  service: string;
  pageType: "homepage" | "location" | "prices" | "about" | "theory" | "qa" | "contact" | "auto-manual" | "enquiry";
  defaultH1: string;
  defaultH2s: string[];
  extraKeywords: string[];
};

const CONTENT_CONFIGS: Record<string, PageConfig> = {
  "/": {
    name: "Home",
    location: `${SITE.location}`,
    service: "driving lessons",
    pageType: "homepage",
    defaultH1: `Driving Lessons in ${SITE.location} & ${SITE.county}`,
    defaultH2s: [
      `Professional Driving Tuition in ${SITE.county}`,
      "Manual & Automatic Lessons Available",
      "Why Choose Dig Driving School?",
      "Driving Lesson Prices",
      "Areas We Cover",
      "What Our Students Say",
    ],
    extraKeywords: [`driving school ${SITE.location.toLowerCase()}`, `learn to drive ${SITE.location.toLowerCase()}`, `driving instructor ${SITE.county.toLowerCase()}`, `automatic driving lessons ${SITE.location.toLowerCase()}`],
  },
  "/about": {
    name: "About Us",
    location: `${SITE.location}`,
    service: "driving instructor",
    pageType: "about",
    defaultH1: `DVSA-Approved Driving Instructor in ${SITE.location}`,
    defaultH2s: [
      "About Your Instructor",
      "Qualifications & Experience",
      "Dig's Teaching Approach",
      `Serving ${SITE.location} & Surrounding Areas`,
    ],
    extraKeywords: [`DVSA approved instructor ${SITE.location.toLowerCase()}`, `driving instructor ${SITE.location.toLowerCase()}`, "qualified driving teacher", `ADI ${SITE.location.toLowerCase()}`],
  },
  "/prices": {
    name: "Prices",
    location: `${SITE.location}`,
    service: "driving lesson prices",
    pageType: "prices",
    defaultH1: `Driving Lesson Prices in ${SITE.location}`,
    defaultH2s: [
      "Manual Driving Lesson Prices",
      "Automatic Driving Lesson Prices",
      "Intensive Driving Courses",
      "Block Booking Discounts",
      "What's Included in Your Lesson",
    ],
    extraKeywords: [`cheap driving lessons ${SITE.location.toLowerCase()}`, `driving lesson cost ${SITE.location.toLowerCase()}`, `intensive driving course ${SITE.location.toLowerCase()}`, "block booking driving lessons"],
  },
  "/auto-vs-manual": {
    name: "Auto vs Manual",
    location: `${SITE.location}`,
    service: "automatic vs manual driving",
    pageType: "auto-manual",
    defaultH1: `Automatic vs Manual Driving Lessons in ${SITE.location}`,
    defaultH2s: [
      "What's the Difference?",
      "Pros & Cons of Automatic Lessons",
      "Pros & Cons of Manual Lessons",
      "Which Should You Choose?",
      "Costs: Automatic vs Manual",
    ],
    extraKeywords: [`automatic driving lessons ${SITE.location.toLowerCase()}`, `manual lessons ${SITE.location.toLowerCase()}`, "automatic car lessons", `which driving licence ${SITE.location.toLowerCase()}`],
  },
  "/theory-test": {
    name: "Theory Test",
    location: `${SITE.location}`,
    service: "theory test",
    pageType: "theory",
    defaultH1: `Theory Test Help & Revision - ${SITE.location}`,
    defaultH2s: [
      "What Is the Theory Test?",
      "Multiple Choice Questions",
      "Hazard Perception Practice",
      "How to Book Your Theory Test",
      "Top Tips to Pass First Time",
    ],
    extraKeywords: [`theory test ${SITE.location.toLowerCase()}`, "driving theory test help", "hazard perception practice", "pass theory test first time"],
  },
  "/qa": {
    name: "Q&A",
    location: `${SITE.location}`,
    service: "driving lessons FAQ",
    pageType: "qa",
    defaultH1: "Driving Lesson FAQs - Dig Driving School",
    defaultH2s: [
      "Getting Started with Lessons",
      "Booking & Cancellations",
      "Driving Test Questions",
      "Lesson Types & Prices",
    ],
    extraKeywords: [`driving lesson questions ${SITE.location.toLowerCase()}`, "how many lessons to pass", "when can I book driving test", "driving school FAQ"],
  },
  "/contact": {
    name: "Contact",
    location: `${SITE.location}`,
    service: "contact",
    pageType: "contact",
    defaultH1: `Contact Dig Driving School - ${SITE.location}`,
    defaultH2s: ["Get in Touch", "Book a Lesson", `Find Us in ${SITE.location}`],
    extraKeywords: [`book driving lesson ${SITE.location.toLowerCase()}`, `contact driving instructor ${SITE.location.toLowerCase()}`, `driving school contact ${SITE.location.toLowerCase()}`],
  },
  "/enquiry": {
    name: "Enquiry",
    location: `${SITE.location}`,
    service: "book driving lessons",
    pageType: "enquiry",
    defaultH1: `Book Your Driving Lessons in ${SITE.location}`,
    defaultH2s: ["Request a Lesson", "What Happens Next?"],
    extraKeywords: [`book driving lesson ${SITE.location.toLowerCase()}`, "driving lesson enquiry", `start driving lessons ${SITE.location.toLowerCase()}`],
  },
};

// Location landing pages are generated from SITE so the service area lives in
// exactly one place. Adding a town to SITE.nearbyTowns gives it SEO defaults.
function slugify(v: string): string {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function locationConfig(place: string, countyWide = false): PageConfig {
  const kw = place.toLowerCase();
  return {
    name: place,
    location: place,
    service: "driving lessons",
    pageType: "location",
    defaultH1: countyWide ? `Driving Lessons Across ${place}` : `Driving Lessons in ${place}`,
    defaultH2s: [
      `Local Driving Instructor in ${place}`,
      `Manual & Automatic Lessons in ${place}`,
      `Areas Covered in ${place}`,
      `Book Driving Lessons in ${place}`,
    ],
    extraKeywords: [
      `driving lessons ${kw}`,
      `driving school ${kw}`,
      `driving instructor ${kw}`,
      `learn to drive ${kw}`,
      `automatic driving lessons ${kw}`,
    ],
  };
}

const LOCATION_CONFIGS: Record<string, PageConfig> = Object.fromEntries([
  [`/locations/${slugify(SITE.location)}`, locationConfig(SITE.location)],
  ...SITE.nearbyTowns.map((t) => [`/locations/${slugify(t)}`, locationConfig(t)] as const),
  [`/locations/${slugify(SITE.county)}`, locationConfig(SITE.county, true)],
]);

const PAGE_CONFIGS: Record<string, PageConfig> = { ...CONTENT_CONFIGS, ...LOCATION_CONFIGS };

// ─── Helpers ───────────────────────────────────────────────────────────────

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

function pickKeywords(competitorKws: string[], pageKws: string[], slug: string): string[] {
  const location = PAGE_CONFIGS[slug]?.location?.toLowerCase() ?? "";
  // Prefer keywords that mention the location or are driving-related
  const ranked = competitorKws.filter((kw) => {
    const k = kw.toLowerCase();
    return k.includes("driving") || k.includes("lesson") || k.includes("instructor") ||
      k.includes("school") || k.includes("test") || k.includes("theory") ||
      (location && k.includes(location));
  });
  const combined = [...new Set([...ranked.slice(0, 8), ...pageKws])];
  return combined.slice(0, 12);
}

function buildTitle(cfg: typeof PAGE_CONFIGS[string], topKw: string): string {
  const loc = cfg.location || `${SITE.county}`;
  if (cfg.pageType === "location") {
    const t = `Driving Lessons in ${loc} | Dig Driving School`;
    return truncate(t, 65);
  }
  if (cfg.pageType === "homepage") {
    const t = `Dig Driving School ${loc} | ${topKw.charAt(0).toUpperCase() + topKw.slice(1)}`;
    return truncate(t, 65);
  }
  if (cfg.pageType === "prices") return truncate(`Driving Lesson Prices ${loc} | Dig Driving School`, 65);
  if (cfg.pageType === "about") return truncate(`DVSA-Approved Driving Instructor ${loc} | About Us`, 65);
  if (cfg.pageType === "theory") return truncate(`Theory Test Help ${loc} | Dig Driving School`, 65);
  if (cfg.pageType === "qa") return truncate(`Driving Lesson FAQs ${loc} | Dig Driving School`, 65);
  if (cfg.pageType === "contact") return truncate(`Book Driving Lessons ${loc} | Contact Dig`, 65);
  if (cfg.pageType === "enquiry") return truncate(`Book Your Driving Lesson in ${loc} | Dig Driving School`, 65);
  if (cfg.pageType === "auto-manual") return truncate(`Automatic vs Manual Lessons ${loc} | Dig Driving School`, 65);
  return truncate(`${cfg.name} | Dig Driving School ${loc}`, 65);
}

function buildDescription(cfg: typeof PAGE_CONFIGS[string], keywords: string[]): string {
  const loc = cfg.location || `${SITE.county}`;
  const kw1 = keywords[0] || `driving lessons ${loc.toLowerCase()}`;
  const kw2 = keywords[1] || "manual and automatic";

  const templates: Record<string, string> = {
    homepage: `Looking for ${kw1}? Dig is a DVSA-approved instructor offering ${kw2} 7 days a week including evenings & weekends. Competitive prices, high pass rates. Book today.`,
    location: `Book ${kw1} with Dig - a DVSA-approved driving instructor. ${kw2.charAt(0).toUpperCase() + kw2.slice(1)} available 7 days a week. Flexible hours, local pickup, great pass rates. Enquire now.`,
    prices: `See Dig's ${kw1} in ${loc}. ${kw2.charAt(0).toUpperCase() + kw2.slice(1)} - manual from £40/hr, automatic from £45/hr. Block bookings save money. DVSA-approved tuition.`,
    about: `Meet Dig - your local ${kw1} in ${loc}. DVSA-approved ADI with 15+ years experience. ${kw2.charAt(0).toUpperCase() + kw2.slice(1)}, flexible hours, patient tuition.`,
    theory: `Prepare for your theory test with Dig Driving School ${loc}. Covers ${kw1}: multiple choice, hazard perception & Highway Code. Tips to pass first time.`,
    qa: `Got questions about ${kw1} in ${loc}? Find answers to the most common driving lesson questions - costs, timings, test booking & more. Dig Driving School.`,
    contact: `Get in touch with Dig Driving School ${loc}. Book ${kw1}, ask about ${kw2} or request more info. Available 7 days a week - call or use our online form.`,
    enquiry: `Request ${kw1} with Dig Driving School ${loc}. Fill in our quick enquiry form - we'll get back to you within 24 hours to arrange your first lesson.`,
    "auto-manual": `Not sure whether to choose ${kw1} in ${loc}? We explain the pros, cons and costs of both. Manual and automatic lessons available - book with Dig today.`,
  };

  const desc = templates[cfg.pageType] || `Professional ${kw1} with Dig Driving School ${loc}. DVSA-approved instructor, 7 days a week. Book your lesson today.`;
  return truncate(desc, 160);
}

// ─── Route ────────────────────────────────────────────────────────────────

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rawSlug = (await params).slug;
  const slug = fromSlugParam(rawSlug);

  const cfg = PAGE_CONFIGS[slug];
  if (!cfg) return NextResponse.json({ error: "Page not configured" }, { status: 400 });

  // Load competitor keywords from DB
  const competitors = await prisma.competitor.findMany({
    where: { lastScanned: { not: null } },
    select: { topKeywords: true, name: true },
  });

  // Extract all competitor single keywords and phrases
  const competitorSingleKws: string[] = [];
  const competitorPhrases: string[] = [];

  for (const c of competitors) {
    if (!c.topKeywords) continue;
    try {
      const parsed = JSON.parse(c.topKeywords);
      if (parsed?.keywords) competitorSingleKws.push(...(parsed.keywords as string[]).slice(0, 20));
      if (parsed?.bigrams) competitorPhrases.push(...(parsed.bigrams as string[]).slice(0, 10));
      if (parsed?.trigrams) competitorPhrases.push(...(parsed.trigrams as string[]).slice(0, 5));
      if (Array.isArray(parsed)) competitorSingleKws.push(...(parsed as string[]).slice(0, 20));
    } catch { /* skip */ }
  }

  // Build page-specific keyword list combining competitor data + page defaults
  const relevantKws = pickKeywords(
    [...competitorPhrases, ...competitorSingleKws],
    cfg.extraKeywords,
    slug
  );

  const focusKeyword = relevantKws[0] || cfg.extraKeywords[0] || `driving lessons ${cfg.location || `${SITE.location.toLowerCase()}`}`;
  const topKw = competitorPhrases[0] || cfg.extraKeywords[0] || "driving lessons";

  const metaTitle = buildTitle(cfg, topKw);
  const metaDesc = buildDescription(cfg, relevantKws);
  const h1 = cfg.defaultH1;
  const h2s = cfg.defaultH2s;
  const keywords = [...new Set([...relevantKws, ...cfg.extraKeywords])].join(", ");

  // Auto-save to DB
  const saved = await prisma.pageSeo.upsert({
    where: { slug },
    update: { metaTitle, metaDesc, h1, focusKeyword, keywords, notes: `Auto-generated on ${new Date().toLocaleDateString("en-GB")} using ${competitors.length} competitor(s).` },
    create: { slug, metaTitle, metaDesc, h1, focusKeyword, keywords, notes: `Auto-generated on ${new Date().toLocaleDateString("en-GB")} using ${competitors.length} competitor(s).` },
  });

  return NextResponse.json({
    ...saved,
    h2Suggestions: h2s,
    competitorCount: competitors.length,
    keywordsUsed: relevantKws.length,
  });
}
