import { SITE } from "@/lib/site-config";

export interface AdminPage {
  title: string;
  slug: string;
  type: "Page" | "Location";
  description: string;
}

/** Real, routable pages on the public site. */
const contentPages: AdminPage[] = [
  { title: "Home", slug: "/", type: "Page", description: "Main landing page" },
  { title: "About Us", slug: "/about", type: "Page", description: "Bio, qualifications & experience" },
  { title: "Lessons", slug: "/lessons", type: "Page", description: "Lesson types & what's covered" },
  { title: "Prices", slug: "/prices", type: "Page", description: "Lesson prices & intensive courses" },
  { title: "Auto vs Manual", slug: "/auto-vs-manual", type: "Page", description: "Comparing transmission types" },
  { title: "Theory Test", slug: "/theory-test", type: "Page", description: "Theory test info & revision tips" },
  { title: "Q&A", slug: "/qa", type: "Page", description: "Frequently asked questions" },
  { title: "Useful Links", slug: "/useful-links", type: "Page", description: "DVSA & GOV.UK resources" },
  { title: "Contact", slug: "/contact", type: "Page", description: "Contact form & details" },
  { title: "Enquiry Form", slug: "/enquiry", type: "Page", description: "General booking enquiry form" },
];

/**
 * Location landing pages targeted for local SEO. These are SEO records first -
 * you can write and store meta for a town before the page itself is built.
 * Driven by SITE so changing the service area updates every admin screen.
 */
const locationPages: AdminPage[] = [
  { title: `Driving Lessons in ${SITE.location}`, slug: `/locations/${slugify(SITE.location)}`, type: "Location", description: `${SITE.location} SEO page` },
  ...SITE.nearbyTowns.map((town) => ({
    title: `Driving Lessons in ${town}`,
    slug: `/locations/${slugify(town)}`,
    type: "Location" as const,
    description: `${town} SEO page`,
  })),
  { title: `Driving Lessons in ${SITE.county}`, slug: `/locations/${slugify(SITE.county)}`, type: "Location", description: "County-wide SEO page" },
];

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Every page the admin SEO / Pages screens know about. */
export const sitePages: AdminPage[] = [...contentPages, ...locationPages];
