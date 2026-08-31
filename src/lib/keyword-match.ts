/**
 * Does a focus keyword appear in a piece of page copy?
 *
 * A plain substring test is too strict for real headlines: the H1
 * "Driving Lessons in Gloucester" does NOT contain the string
 * "driving lessons gloucester" because of the joining word, so a perfectly
 * well-optimised page was scored as a miss. Google does not require an exact
 * run of characters either - it reads the words. So we compare meaningful
 * words instead, ignoring punctuation and common joining words.
 */
const FILLER = new Set(["in", "at", "the", "a", "an", "and", "of", "for", "to", "your", "with", "on", "from"]);

/** Crude singular form, so "driving lesson" and "driving lessons" agree. */
function singular(word: string): string {
  return word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
}

function meaningfulWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !FILLER.has(w))
    .map(singular);
}

/** True when every meaningful word of `keyword` appears somewhere in `text`. */
export function keywordAppearsIn(keyword: string, text: string): boolean {
  if (!keyword.trim() || !text.trim()) return false;
  const haystack = meaningfulWords(text);
  const needles = meaningfulWords(keyword);
  return needles.length > 0 && needles.every((w) => haystack.includes(w));
}
