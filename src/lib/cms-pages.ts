import type { BannerData } from "@/lib/content";

export interface CmsPage {
  title: string;
  slug: string;
  type: "Page" | "Location";
  /** Default banner content shown when nothing has been saved yet. */
  banner: BannerData;
}

/**
 * Registry of every editable page and its default section content.
 * The admin Content editor and the public pages both read from this so the
 * "fallback" content stays in one place.
 */
export const cmsPages: CmsPage[] = [
  {
    title: "Home",
    slug: "/",
    type: "Page",
    banner: {
      imageUrl: "/banners/home.jpg",
      overlay: 55,
      eyebrow: "DVSA APPROVED INSTRUCTOR",
      heading: "learn to drive, properly.",
      subheading:
        "Calm, structured tuition in manual and automatic cars. Door-to-door pick-up, seven days a week, and a pass rate we're genuinely proud of.",
    },
  },
  {
    title: "About Us",
    slug: "/about",
    type: "Page",
    banner: {
      imageUrl: "/banners/about.jpg",
      overlay: 55,
      eyebrow: "WHO YOU'LL BE LEARNING WITH",
      heading: "about DIG driving school",
      subheading: "Fully qualified, DVSA-approved instruction with a modern, no-pressure approach to learning.",
    },
  },
  {
    title: "Prices",
    slug: "/prices",
    type: "Page",
    banner: {
      imageUrl: "/banners/prices.jpg",
      overlay: 55,
      eyebrow: "NO HIDDEN FEES",
      heading: "prices & packages",
      subheading:
        "Straightforward pricing with no surprises. Evenings and weekends at no extra cost. Block bookings valid for three months.",
    },
  },
  {
    title: "Lessons",
    slug: "/lessons",
    type: "Page",
    banner: {
      imageUrl: "/banners/lessons.jpg",
      overlay: 55,
      eyebrow: "WHAT WE TEACH",
      heading: "driving lessons",
      subheading: "From your very first lesson to test day - every stage covered, at a pace that suits you.",
    },
  },
  {
    title: "Auto vs Manual",
    slug: "/auto-vs-manual",
    type: "Page",
    banner: {
      imageUrl: "/banners/auto-vs-manual.jpg",
      overlay: 55,
      eyebrow: "MAKING THE RIGHT CHOICE",
      heading: "auto vs manual",
      subheading: "Not sure which to learn in? Here's an honest breakdown so you can pick the right one first time.",
    },
  },
  {
    title: "Theory Test",
    slug: "/theory-test",
    type: "Page",
    banner: {
      imageUrl: "/banners/theory-test.jpg",
      overlay: 55,
      eyebrow: "PREPARE TO PASS",
      heading: "the theory test",
      subheading: "You'll need to pass theory before you can book your practical. Here's exactly how it works and how we help.",
    },
  },
  {
    title: "Q&A",
    slug: "/qa",
    type: "Page",
    banner: {
      imageUrl: "/banners/qa.jpg",
      overlay: 55,
      eyebrow: "COMMON QUESTIONS",
      heading: "questions, answered",
      subheading: "Everything worth knowing before you book your first lesson.",
    },
  },
  {
    title: "Contact",
    slug: "/contact",
    type: "Page",
    banner: {
      imageUrl: "/banners/contact.jpg",
      overlay: 55,
      eyebrow: "GET IN TOUCH",
      heading: "contact us",
      subheading: "Send us a message and we'll come back to you within 24 hours to confirm availability.",
    },
  },
  {
    title: "Enquiry Form",
    slug: "/enquiry",
    type: "Page",
    banner: {
      imageUrl: "/banners/enquiry.jpg",
      overlay: 55,
      eyebrow: "START HERE",
      heading: "book your first lesson",
      subheading: "Fill in the form below and we'll be in touch within 24 hours to get you booked in.",
    },
  },
  {
    title: "Useful Links",
    slug: "/useful-links",
    type: "Page",
    banner: {
      imageUrl: "/banners/useful-links.jpg",
      overlay: 55,
      eyebrow: "HELPFUL RESOURCES",
      heading: "useful links",
      subheading: "Everything you need - from applying for your provisional licence to booking your theory and practical tests.",
    },
  },
];

export function getCmsPage(slug: string): CmsPage | undefined {
  return cmsPages.find((p) => p.slug === slug);
}
