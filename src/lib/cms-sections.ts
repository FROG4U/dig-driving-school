// Schema-driven definitions for the editable (non-banner) sections of each
// page. The admin Content editor renders fields from these schemas, and the
// public pages read their content with getSection(slug, key, defaults).

import { SITE } from "@/lib/site-config";

export type SimpleFieldType = "text" | "textarea" | "icon" | "image";

export interface SimpleField {
  key: string;
  label: string;
  type: SimpleFieldType;
}

export interface ListField {
  key: string;
  label: string;
  type: "list";
  itemLabel: string; // singular noun, e.g. "service"
  fields: SimpleField[];
}

export type SectionField = SimpleField | ListField;

export interface SectionSchema {
  key: string; // sectionKey stored in DB
  title: string; // shown in the editor
  icon?: string;
  fields: SectionField[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaults: Record<string, any>;
}

// ── Homepage sections ────────────────────────────────────────────────
const homeServices: SectionSchema = {
  key: "services",
  title: "Services",
  icon: "🧰",
  fields: [
    { key: "eyebrow", label: "Eyebrow", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    { key: "subtext", label: "Sub-text", type: "textarea" },
    {
      key: "items",
      label: "Service cards",
      type: "list",
      itemLabel: "service",
      fields: [
        { key: "icon", label: "Icon", type: "icon" },
        { key: "title", label: "Title", type: "text" },
        { key: "desc", label: "Description", type: "textarea" },
      ],
    },
  ],
  defaults: {
    eyebrow: "WHAT WE OFFER",
    heading: "every kind of learner, covered",
    subtext: "Complete beginner or coming back after years off the road - there's a lesson plan built around where you actually are.",
    items: [
      { icon: "car", title: "Beginner lessons", desc: "Start from absolutely nothing. Structured, progressive lessons that build confidence before they build speed." },
      { icon: "automatic", title: "Automatic tuition", desc: "No clutch, no gears, no stalling. Put all your attention into road position, observation and hazard awareness." },
      { icon: "bolt", title: "Intensive courses", desc: "Need a licence fast? Condensed daily driving that covers the full syllabus in weeks rather than months." },
      { icon: "steering", title: "Refresher lessons", desc: "Passed a while ago but lost your nerve? Rebuild it at your own pace, no judgement, no pressure." },
      { icon: "book", title: "Theory support", desc: "Guidance through the theory and hazard perception tests, plus the resources that actually move the needle." },
      { icon: "trophy", title: "Test preparation", desc: "Mock tests on real test-centre routes, manoeuvres under pressure, and the independent driving section nailed." },
    ],
  },
};

const homeStats: SectionSchema = {
  key: "stats",
  title: "Stats bar",
  icon: "📊",
  fields: [
    {
      key: "items",
      label: "Stats",
      type: "list",
      itemLabel: "stat",
      fields: [
        { key: "value", label: "Value", type: "text" },
        { key: "label", label: "Label", type: "text" },
      ],
    },
  ],
  defaults: {
    items: [
      { value: "8+", label: "Years teaching" },
      { value: "300+", label: "Pupils passed" },
      { value: "7", label: "Days a week" },
      { value: "1st", label: "Time pass focus" },
    ],
  },
};

const homeTestimonials: SectionSchema = {
  key: "testimonials",
  title: "Testimonials",
  icon: "⭐",
  fields: [
    { key: "eyebrow", label: "Eyebrow", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    {
      key: "items",
      label: "Reviews",
      type: "list",
      itemLabel: "review",
      fields: [
        { key: "quote", label: "Quote", type: "textarea" },
        { key: "name", label: "Name", type: "text" },
        { key: "location", label: "Location", type: "text" },
        { key: "initials", label: "Initials", type: "text" },
      ],
    },
  ],
  defaults: {
    eyebrow: "TESTIMONIALS",
    heading: "what our pupils say",
    items: [
      { initials: "SM", name: "Sarah M.", location: "Passed 2026", quote: "I was genuinely terrified of driving. Never once felt rushed or stupid for asking something twice. Passed first time." },
      { initials: "JT", name: "James T.", location: "Passed 2026", quote: "Explains the why behind everything instead of just barking instructions. That's what made it click for me." },
      { initials: "PK", name: "Priya K.", location: "Passed 2025", quote: "The block booking was brilliant value and the structure meant I could actually see myself improving week to week." },
    ],
  },
};

const homeCta: SectionSchema = {
  key: "cta",
  title: "Closing call-to-action",
  icon: "📣",
  fields: [
    { key: "eyebrow", label: "Eyebrow", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    { key: "text", label: "Main line", type: "textarea" },
    { key: "offer", label: "Offer line", type: "text" },
  ],
  defaults: {
    eyebrow: "GET STARTED TODAY",
    heading: "ready to get behind the wheel?",
    text: "Book your first lesson today. Picked up from your door, seven days a week.",
    offer: "Manual lessons £35/hr · Automatic £40/hr",
  },
};

// Numbered "how it works" strip - a signature block on the homepage.
const homeProcess: SectionSchema = {
  key: "process",
  title: "How it works",
  icon: "🔢",
  fields: [
    { key: "eyebrow", label: "Eyebrow", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    {
      key: "items",
      label: "Steps",
      type: "list",
      itemLabel: "step",
      fields: [
        { key: "title", label: "Title", type: "text" },
        { key: "desc", label: "Description", type: "textarea" },
      ],
    },
  ],
  defaults: {
    eyebrow: "HOW IT WORKS",
    heading: "four steps to a licence",
    items: [
      { title: "Get in touch", desc: "Send an enquiry or give us a ring. We'll talk through where you're at and what you're aiming for." },
      { title: "First lesson", desc: "A relaxed two-hour assessment drive so we can build a plan around your actual ability, not a template." },
      { title: "Build the skills", desc: "Weekly lessons working through the DVSA syllabus, with honest progress feedback after every session." },
      { title: "Pass your test", desc: "Mock tests on real routes until test day feels like just another lesson. Then you drive home on your own." },
    ],
  },
};

const homeAbout: SectionSchema = {
  key: "about",
  title: "Instructor photo (homepage)",
  icon: "🧑",
  fields: [
    { key: "imageUrl", label: "Photo of the instructor / car", type: "image" },
  ],
  defaults: {
    imageUrl: "",
  },
};

const aboutInstructorPhoto: SectionSchema = {
  key: "dig-photo",
  title: "Instructor photo",
  icon: "🧑",
  fields: [
    { key: "imageUrl", label: "Photo of the instructor / car", type: "image" },
  ],
  defaults: {
    // Stand-in so the slot is not an empty grey panel. Replace it with a real
    // photo of DIG and the car in Admin -> Content, which overrides this.
    imageUrl: "/banners/instructor.jpg",
  },
};

// Keyword-rich local-SEO blurb for the homepage. Written to read naturally
// (Google penalises stuffing) while covering the terms people actually search:
// "driving lessons in <town>", "manual and automatic", "intensive courses",
// "pass your driving test", etc. Defaults pull the town/county from SITE so
// they stay correct when the service area changes; the owner can overwrite the
// whole thing in Admin → Content.
const homeSeo: SectionSchema = {
  key: "seo",
  title: "About / SEO blurb",
  icon: "🔎",
  fields: [
    { key: "eyebrow", label: "Eyebrow", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    { key: "body", label: "Paragraph 1", type: "textarea" },
    { key: "body2", label: "Paragraph 2", type: "textarea" },
  ],
  defaults: {
    eyebrow: `Driving lessons in ${SITE.location} & Hartpury`,
    heading: `Your local driving school in ${SITE.location} and Hartpury`,
    body: `DIG Driving School provides friendly, professional driving lessons in ${SITE.location}, Hartpury and across ${SITE.county}. Whether you're a complete beginner booking your very first lesson or a nervous driver coming back after a break, our DVSA-approved driving instructor teaches both manual and automatic driving lessons at a pace that suits you.`,
    body2: `We offer manual and automatic driving lessons, refresher sessions and theory test support - all with door-to-door pick-up, seven days a week. With structured lessons and a genuine focus on helping you pass your driving test first time, we get learner drivers across ${SITE.location} on the road with confidence. 10-hour block bookings are available.`,
  },
};

export const pageSections: Record<string, SectionSchema[]> = {
  "/": [homeServices, homeProcess, homeStats, homeAbout, homeTestimonials, homeSeo, homeCta],
  "/about": [aboutInstructorPhoto],
};

export function getPageSectionSchemas(slug: string): SectionSchema[] {
  return pageSections[slug] ?? [];
}

export function getSectionSchema(slug: string, key: string): SectionSchema | undefined {
  return getPageSectionSchemas(slug).find((s) => s.key === key);
}
