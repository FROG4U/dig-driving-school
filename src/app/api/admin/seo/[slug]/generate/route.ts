import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { fromSlugParam } from "@/lib/slug";
import { keywordAppearsIn } from "@/lib/keyword-match";
import { SITE } from "@/lib/site-config";

// ─── Page configs ──────────────────────────────────────────────────────────
type PageConfig = {
  name: string;
  location?: string;
  service: string;
  pageType: "homepage" | "location" | "prices" | "about" | "theory" | "qa" | "contact" | "auto-manual" | "enquiry" | "lessons" | "links";
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
      "Why Choose DIG Driving School?",
      "Driving Lesson Prices",
      "Areas We Cover",
      "What Our Students Say",
    ],
    extraKeywords: [`driving lessons ${SITE.location.toLowerCase()}`, `driving school ${SITE.location.toLowerCase()}`, `learn to drive ${SITE.location.toLowerCase()}`, `driving instructor ${SITE.county.toLowerCase()}`, `automatic driving lessons ${SITE.location.toLowerCase()}`],
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
      "DIG's Teaching Approach",
      `Serving ${SITE.location} & Surrounding Areas`,
    ],
    extraKeywords: [`DVSA approved instructor ${SITE.location.toLowerCase()}`, `driving instructor ${SITE.location.toLowerCase()}`, "qualified driving teacher", `ADI ${SITE.location.toLowerCase()}`],
  },
  "/lessons": {
    name: "Lessons",
    location: `${SITE.location}`,
    service: "driving lessons",
    pageType: "lessons",
    defaultH1: `Driving Lessons in ${SITE.location} - Manual & Automatic`,
    defaultH2s: [
      "Manual Driving Lessons",
      "Automatic Driving Lessons",
      "10-Hour Block Bookings",
      "Refresher & Returning Drivers",
      "Theory Test Preparation",
      "What To Expect In Your First Lesson",
    ],
    extraKeywords: [`driving lessons ${SITE.location.toLowerCase()}`, `manual driving lessons ${SITE.location.toLowerCase()}`, `automatic driving lessons ${SITE.location.toLowerCase()}`, `intensive driving course ${SITE.location.toLowerCase()}`],
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
    extraKeywords: [`driving lesson prices ${SITE.location.toLowerCase()}`, `cheap driving lessons ${SITE.location.toLowerCase()}`, `driving lesson cost ${SITE.location.toLowerCase()}`, `intensive driving course ${SITE.location.toLowerCase()}`, "block booking driving lessons"],
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
    defaultH1: `Driving Lesson FAQs in ${SITE.location}`,
    defaultH2s: [
      "Getting Started with Lessons",
      "Booking & Cancellations",
      "Driving Test Questions",
      "Lesson Types & Prices",
    ],
    extraKeywords: [`driving lessons ${SITE.location.toLowerCase()}`, `driving lesson questions ${SITE.location.toLowerCase()}`, "how many lessons to pass", "when can I book driving test", "driving school FAQ"],
  },
  "/useful-links": {
    name: "Useful Links",
    location: `${SITE.location}`,
    service: "learner driver resources",
    pageType: "links",
    defaultH1: `Useful Links For Learner Drivers In ${SITE.location}`,
    defaultH2s: [
      "Get Yourself Licensed",
      "Book Your Tests",
      "Learn The Rules",
      "Driving Test Costs",
      "Find A Test Centre",
    ],
    extraKeywords: [`learner drivers ${SITE.location.toLowerCase()}`, "provisional licence application", "book theory test", "book practical driving test", "highway code", `driving test centre ${SITE.location.toLowerCase()}`],
  },
  "/contact": {
    name: "Contact",
    location: `${SITE.location}`,
    service: "contact",
    pageType: "contact",
    defaultH1: `Book Driving Lessons in ${SITE.location}`,
    defaultH2s: ["Get in Touch", "Book a Lesson", `Find Us in ${SITE.location}`],
    extraKeywords: [`driving lessons ${SITE.location.toLowerCase()}`, `book driving lesson ${SITE.location.toLowerCase()}`, `contact driving instructor ${SITE.location.toLowerCase()}`, `driving school contact ${SITE.location.toLowerCase()}`],
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

/** Words that are ours or generic to the trade, so never a rival's brand. */
const GENERIC_TRADE_WORDS = new Set([
  "driving", "drive", "driver", "drivers", "school", "schools", "lesson", "lessons",
  "instructor", "instructors", "academy", "tuition", "test", "tests", "theory",
  "practical", "manual", "automatic", "learner", "learners", "pass", "dig",
  "ltd", "limited", "uk", "co", "com", "www", "the", "and", "of", "in", "near", "me",
]);

/**
 * Distinctive words from each competitor's name and domain - i.e. their brand.
 * A scan of bravodriving.co.uk surfaces "bravo driving" as a top phrase, and
 * without this filter it ended up advertised in our own meta description.
 */
function competitorBrandWords(competitors: { name: string; url: string }[]): Set<string> {
  const brands = new Set<string>();
  const ours = [SITE.location.toLowerCase(), SITE.county.toLowerCase()];

  for (const c of competitors) {
    const fromName = c.name.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
    let host = "";
    try {
      host = new URL(c.url).hostname.replace(/^www\./, "").split(".")[0] ?? "";
    } catch {
      /* a malformed URL just contributes no host words */
    }
    for (const w of [...fromName, host]) {
      if (w && w.length > 2 && !GENERIC_TRADE_WORDS.has(w) && !ours.includes(w)) brands.add(w);
    }
  }
  return brands;
}

/** Higher is better: local intent first, then real phrases over bare words. */
function scoreKeyword(kw: string, location: string): number {
  const words = kw.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  if (location && kw.toLowerCase().includes(location)) score += 4;
  if (words.length >= 2 && words.length <= 4) score += 2;
  if (words.length === 1) score -= 2;
  if (/lesson|instructor|school|driving|test|theory/.test(kw.toLowerCase())) score += 1;
  return score;
}

function pickKeywords(
  competitorKws: string[],
  pageKws: string[],
  slug: string,
  brandWords: Set<string>
): string[] {
  const location = PAGE_CONFIGS[slug]?.location?.toLowerCase() ?? "";

  const relevant = competitorKws.filter((kw) => {
    const k = kw.toLowerCase();
    const words = k.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    // Never reuse a rival's brand name in our own copy or keyword list.
    if (words.some((w) => brandWords.has(w))) return false;
    return k.includes("driving") || k.includes("lesson") || k.includes("instructor") ||
      k.includes("school") || k.includes("test") || k.includes("theory") ||
      (location && k.includes(location));
  });

  const ranked = [...new Set(relevant)].sort((a, b) => scoreKeyword(b, location) - scoreKeyword(a, location));
  // Page defaults are hand-written for this page, so they rank alongside.
  const combined = [...new Set([...ranked.slice(0, 8), ...pageKws])];
  return combined.sort((a, b) => scoreKeyword(b, location) - scoreKeyword(a, location)).slice(0, 12);
}

function buildTitle(cfg: typeof PAGE_CONFIGS[string]): string {
  const loc = cfg.location || `${SITE.county}`;
  if (cfg.pageType === "location") {
    const t = `Driving Lessons in ${loc} | DIG Driving School`;
    return truncate(t, 65);
  }
  if (cfg.pageType === "homepage") {
    // Written from the page, not from a scraped phrase - a competitor's brand
    // name used to land here whenever their site ranked highest in the scan.
    const t = `Driving Lessons in ${loc} | DIG Driving School`;
    return truncate(t, 65);
  }
  if (cfg.pageType === "prices") return truncate(`Driving Lesson Prices ${loc} | DIG Driving School`, 65);
  if (cfg.pageType === "about") return truncate(`DVSA-Approved Driving Instructor ${loc} | About Us`, 65);
  if (cfg.pageType === "theory") return truncate(`Theory Test Help ${loc} | DIG Driving School`, 65);
  if (cfg.pageType === "qa") return truncate(`Driving Lesson FAQs ${loc} | DIG Driving School`, 65);
  if (cfg.pageType === "contact") return truncate(`Book Driving Lessons ${loc} | Contact DIG`, 65);
  if (cfg.pageType === "enquiry") return truncate(`Book Your Driving Lessons in ${loc} | DIG Driving School`, 65);
  if (cfg.pageType === "lessons") return truncate(`Driving Lessons ${loc} | Manual & Automatic | DIG`, 65);
  if (cfg.pageType === "links") return truncate(`Useful Links For Learner Drivers in ${loc} | DIG`, 65);
  if (cfg.pageType === "auto-manual") return truncate(`Automatic vs Manual Lessons ${loc} | DIG Driving School`, 65);
  return truncate(`${cfg.name} | DIG Driving School ${loc}`, 65);
}

/**
 * Meta descriptions are written for the page, not assembled from scraped
 * phrases. Splicing a competitor keyword into a sentence produced both broken
 * grammar ("Request driving school with DIG Driving School") and, worse, a
 * rival's brand name in our own Google snippet ("offering bravo driving 7 days
 * a week"). Every template names the town and the service, so a good local
 * keyword is present without any string surgery.
 */
function buildDescription(cfg: typeof PAGE_CONFIGS[string]): string {
  const loc = cfg.location || `${SITE.county}`;

  const templates: Record<string, string> = {
    homepage: `Learning to drive in ${loc}? DIG Driving School offers manual and automatic driving lessons 7 days a week, with competitive prices and a high pass rate.`,
    location: `Book driving lessons in ${loc} with DIG - a DVSA-approved driving instructor. Manual and automatic tuition, flexible hours and door-to-door pick-up.`,
    prices: `See our driving lesson prices in ${loc}. Manual and automatic lessons, block-booking discounts and intensive courses from a DVSA-approved driving school.`,
    about: `Meet DIG - a DVSA-approved driving instructor in ${loc}, teaching manual and automatic driving lessons to nervous beginners and returning drivers alike.`,
    theory: `Theory test help for learner drivers in ${loc}. Hazard perception, multiple choice and Highway Code revision tips from DIG Driving School to help you pass.`,
    qa: `Answers to common driving lesson questions in ${loc} - what lessons cost, how many you need, booking your test and what to expect from your instructor.`,
    contact: `Contact DIG Driving School in ${loc} to book driving lessons or ask a question. Call or use the online form - we reply within 24 hours, 7 days a week.`,
    enquiry: `Book driving lessons in ${loc} with DIG Driving School. Fill in the quick enquiry form and we will reply within 24 hours to arrange your first lesson.`,
    lessons: `Manual and automatic driving lessons in ${loc} with a DVSA-approved instructor. Hourly lessons, 10-hour blocks, refresher courses and theory test support.`,
    links: `Useful links for learner drivers in ${loc}: apply for a provisional licence, book your theory and practical tests, find a test centre and read the Highway Code.`,
    "auto-manual": `Automatic or manual driving lessons in ${loc}? We compare the costs, the licence rules and how long each takes so you can pick the right one first time.`,
  };

  const desc =
    templates[cfg.pageType] ||
    `${cfg.name} at DIG Driving School in ${loc}. DVSA-approved driving lessons, manual and automatic, available 7 days a week. Book your first lesson today.`;
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
    select: { topKeywords: true, name: true, url: true },
  });
  const brandWords = competitorBrandWords(competitors);

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
    slug,
    brandWords
  );

  const metaTitle = buildTitle(cfg);
  const metaDesc = buildDescription(cfg);
  const h1 = cfg.defaultH1;

  // Pick the strongest keyword that actually appears in all three places we are
  // scored on. Targeting a phrase that is written nowhere on the page is what
  // dragged pages down to 80% - and it was a fair criticism, not a bad check.
  const candidates = [...relevantKws, ...cfg.extraKeywords];
  const focusKeyword =
    candidates.find(
      (kw) =>
        keywordAppearsIn(kw, metaTitle) &&
        keywordAppearsIn(kw, metaDesc) &&
        keywordAppearsIn(kw, h1)
    ) ||
    candidates.find((kw) => keywordAppearsIn(kw, metaTitle) && keywordAppearsIn(kw, h1)) ||
    candidates[0] ||
    `driving lessons ${(cfg.location || SITE.location).toLowerCase()}`;
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
