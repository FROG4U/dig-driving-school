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
