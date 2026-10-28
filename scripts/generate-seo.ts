/**
 * Regenerate the stored SEO record for every page.
 *
 * The same thing the admin "Generate All SEO" button does, but runnable on the
 * server:   npm run seo:generate
 *
 * Useful after changing anything the templates read - the brand name, prices,
 * the town - because those live in code while the records live in the database.
 */
import { SEO_SLUGS, generateSeoForSlug } from "../src/lib/seo-generate";

async function main() {
  let ok = 0;
  const failures: string[] = [];

  for (const slug of SEO_SLUGS) {
    try {
      const r = await generateSeoForSlug(slug);
      ok++;
      console.log(`ok   ${slug.padEnd(28)} ${r.metaTitle}`);
    } catch (err) {
      failures.push(slug);
      console.log(`FAIL ${slug.padEnd(28)} ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\n${ok}/${SEO_SLUGS.length} pages regenerated`);
  if (failures.length) {
    console.log(`failed: ${failures.join(", ")}`);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .then(() => process.exit(0));
