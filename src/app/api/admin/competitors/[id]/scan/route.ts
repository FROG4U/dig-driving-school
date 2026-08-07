import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

function superAdminOnly(user: Awaited<ReturnType<typeof getAdminUser>>) {
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

// ─── Extraction helpers ────────────────────────────────────────────────────

function extractMeta(html: string, name: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${name}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1].trim();
  }
  return "";
}

function extractTags(html: string, tag: string, limit = 20): string[] {
  const matches = [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"))];
  return matches
    .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&amp;/g, "&").replace(/&#\d+;/g, "").trim())
    .filter((t) => t.length > 2 && t.length < 200)
    .slice(0, limit);
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].replace(/\s+/g, " ").trim() : "";
}

function extractCanonical(html: string): string {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1] : "";
}

function extractImageAlts(html: string): string[] {
  const matches = [...html.matchAll(/<img[^>]+alt=["']([^"']+)["']/gi)];
  return matches
    .map((m) => m[1].trim())
    .filter((a) => a.length > 2)
    .slice(0, 15);
}

function extractLinks(html: string, baseUrl: string): { internal: number; external: number } {
  const matches = [...html.matchAll(/href=["']([^"'#?]+)["']/gi)];
  let internal = 0, external = 0;
  const base = new URL(baseUrl).hostname;
  for (const m of matches) {
    const href = m[1];
    if (href.startsWith("http")) {
      try { new URL(href).hostname === base ? internal++ : external++; } catch { /* skip */ }
    } else if (href.startsWith("/")) {
      internal++;
    }
  }
  return { internal, external };
}

function hasSchemaOrg(html: string): boolean {
  return /schema\.org|application\/ld\+json/i.test(html);
}

function extractSchemaTypes(html: string): string[] {
  const matches = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)];
  return [...new Set(matches.map((m) => m[1]))].slice(0, 10);
}

function hasOpenGraph(html: string): boolean {
  return /property=["']og:/i.test(html);
}

function extractBodyText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","up",
  "about","into","through","during","is","are","was","were","be","been","being","have",
  "has","had","do","does","did","will","would","could","should","may","might","shall",
  "this","that","these","those","it","its","you","your","we","our","they","their","i",
  "my","he","his","she","her","us","them","not","no","nor","so","yet","both","either",
  "each","few","more","most","other","some","such","than","then","too","very","just",
  "can","all","also","as","if","when","where","who","which","what","how","why","www",
  "com","co","uk","http","https","gt","lt","amp","nbsp","get","also","make","made",
  "take","need","want","use","using","used","like","know","good","page","click","here",
  "find","time","year","day","way","new","now","back","see","look","one","two","three",
]);

function topKeywords(text: string, limit = 30): string[] {
  const words = text.match(/\b[a-z]{4,}\b/g) || [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (!STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([w]) => w);
}

function topBigrams(text: string, limit = 20): string[] {
  const words = (text.match(/\b[a-z]{3,}\b/g) || []).filter((w) => !STOP_WORDS.has(w));
  const freq: Record<string, number> = {};
  for (let i = 0; i < words.length - 1; i++) {
    const bg = `${words[i]} ${words[i + 1]}`;
    freq[bg] = (freq[bg] || 0) + 1;
  }
  return Object.entries(freq)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([bg]) => bg);
}

function topTrigrams(text: string, limit = 10): string[] {
  const words = (text.match(/\b[a-z]{3,}\b/g) || []).filter((w) => !STOP_WORDS.has(w));
  const freq: Record<string, number> = {};
  for (let i = 0; i < words.length - 2; i++) {
    const tg = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    freq[tg] = (freq[tg] || 0) + 1;
  }
  return Object.entries(freq)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tg]) => tg);
}

function wordCount(text: string): number {
  return (text.match(/\b[a-z]+\b/g) || []).length;
}

// ─── Route ────────────────────────────────────────────────────────────────

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  const err = superAdminOnly(user);
  if (err) return err;

  const { id } = await params;
  const competitor = await prisma.competitor.findUnique({ where: { id } });
  if (!competitor) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const res = await fetch(competitor.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.5",
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Site returned ${res.status}` }, { status: 502 });
    }

    const html = await res.text();
    const bodyText = extractBodyText(html);

    const metaTitle = extractMeta(html, "title");
    const metaDesc = extractMeta(html, "description");
    const ogTitle = extractMeta(html, "og:title") || extractMeta(html, "title");
    const ogDesc = extractMeta(html, "og:description") || extractMeta(html, "description");
    const pageTitle = extractTitle(html);
    const canonical = extractCanonical(html);

    const h1Tags = extractTags(html, "h1", 10);
    const h2Tags = extractTags(html, "h2", 20);
    const h3Tags = extractTags(html, "h3", 20);

    const imageAlts = extractImageAlts(html);
    const links = extractLinks(html, competitor.url);
    const schemaTypes = extractSchemaTypes(html);
    const wc = wordCount(bodyText);

    const keywords = topKeywords(bodyText, 30);
    const bigrams = topBigrams(bodyText, 20);
    const trigrams = topTrigrams(bodyText, 10);

    // Build a combined extras object for extended data
    const extras = {
      canonical,
      ogTitle,
      ogDesc,
      h3Tags,
      imageAlts,
      links,
      schemaTypes,
      hasSchema: hasSchemaOrg(html),
      hasOpenGraph: hasOpenGraph(html),
      wordCount: wc,
      bigrams,
      trigrams,
    };

    const updated = await prisma.competitor.update({
      where: { id },
      data: {
        metaTitle: metaTitle || pageTitle,
        metaDesc: metaDesc || ogDesc,
        pageTitle,
        h1Tags: JSON.stringify(h1Tags),
        h2Tags: JSON.stringify(h2Tags),
        topKeywords: JSON.stringify({ keywords, bigrams, trigrams, extras }),
        lastScanned: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Scan failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
