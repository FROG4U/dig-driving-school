/**
 * Fully decode a page slug taken from a dynamic route segment.
 *
 * On some hosting stacks (Plesk + nginx + Apache/Passenger, as used in
 * production) an encoded slash in the URL (`%2F`) gets re-encoded by the proxy
 * chain to `%252F`, so the app receives a double-encoded slug. A single
 * `decodeURIComponent` then yields `%2Fabout` instead of `/about`, which breaks
 * page lookups. Decoding repeatedly until the value stops changing handles both
 * the single- and double-encoded cases. Our slugs never legitimately contain a
 * `%`, so this is safe.
 */
export function decodeSlug(raw: string): string {
  let cur = raw;
  for (let i = 0; i < 3; i++) {
    let next: string;
    try {
      next = decodeURIComponent(cur);
    } catch {
      return cur;
    }
    if (next === cur) break;
    cur = next;
  }
  return cur;
}

/**
 * Convert a page slug into a URL path segment that survives the production
 * proxy chain.
 *
 * Slugs are paths ("/", "/about", "/locations/gloucester"), so the obvious
 * `encodeURIComponent` produces an encoded slash (`%2Fabout`). Plesk's
 * nginx/Passenger chain does NOT pass those through - every `%2F` URL 404s
 * before it ever reaches Next (verified in the live access log), which is what
 * broke the whole SEO and content admin. So we avoid `%` entirely and use `~`,
 * an unreserved RFC-3986 character, as the path separator instead.
 *
 *   "/"                       -> "home"
 *   "/about"                  -> "about"
 *   "/locations/gloucester"   -> "locations~gloucester"
 */
export function toSlugParam(slug: string): string {
  const clean = slug.startsWith("/") ? slug.slice(1) : slug;
  if (clean === "") return "home";
  return clean.replace(/\//g, "~");
}

/** Inverse of toSlugParam. Still understands old `%2F`-style links. */
export function fromSlugParam(param: string): string {
  const decoded = decodeSlug(param);
  // Legacy link that still carried a real (or encoded) slash.
  if (decoded.includes("/")) return decoded.startsWith("/") ? decoded : `/${decoded}`;
  if (decoded === "home") return "/";
  return `/${decoded.replace(/~/g, "/")}`;
}
