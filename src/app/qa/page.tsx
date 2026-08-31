import type { Metadata } from "next";
import Link from "next/link";
import { getPageMetadata } from "@/lib/seo";
import { getBanner, bannerBg } from "@/lib/content";
import { getCmsPage } from "@/lib/cms-pages";
import { getContactSettings } from "@/lib/site-settings";
import { SITE } from "@/lib/site-config";
import Icon from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/qa", {
    title: `Driving Lesson FAQs ${SITE.location} | ${SITE.name}`,
    description: `Answers to the questions we get asked most in ${SITE.location} - what lessons cost, how many hours you'll need, booking and cancelling, manual versus automatic, and what happens on test day.`,
  });
}

type QA = { q: string; a: string };
type Category = { category: string; blurb: string; icon: string; questions: QA[] };

const faqs: Category[] = [
  {
    category: "Getting started",
    blurb: "Before your first lesson.",
    icon: "sparkle",
    questions: [
      {
        q: "How old do I need to be to start lessons?",
        a: "You need to be 17 to drive on a public road in the UK. You can apply for your provisional licence from 15 years and 9 months, so it is worth getting that in early - it will be sitting in a drawer waiting for your birthday.",
      },
      {
        q: "Do I need my provisional licence before the first lesson?",
        a: "Yes. You must hold a valid UK provisional before you can legally drive on the road, so bring it with you to your first lesson - we cannot start without it.",
      },
      {
        q: "What should I bring?",
        a: "Your provisional licence and comfortable, flat shoes you can feel the pedals through. That is genuinely it. Everything else is in the car.",
      },
      {
        q: "I'm really nervous. Is that a problem?",
        a: "Not remotely - it is closer to the norm than the exception. We start somewhere quiet and go at whatever pace keeps you thinking clearly, and we don't move to busier roads until that first bit feels easy.",
      },
    ],
  },
  {
    category: "Lessons and booking",
    blurb: "How we run things week to week.",
    icon: "calendar",
    questions: [
      {
        q: "How do I book a lesson?",
        a: "Send us an enquiry through this site and we will come back to you with availability and get your first lesson in the diary. If you would rather talk it through first, our contact details are on the contact page.",
      },
      {
        q: "How long is a lesson?",
        a: "One or two hours. Most people get on better with two - there is time to warm up, work on something properly and still consolidate it before you finish. We will tell you honestly what suits you.",
      },
      {
        q: "Can I have lessons in the evening or at the weekend?",
        a: "Yes. We teach seven days a week including evenings and weekends, and there is no premium for unsociable hours.",
      },
      {
        q: "How many lessons will I need?",
        a: "It genuinely varies. The DVSA average is around 45 hours of professional tuition. We will give you a realistic estimate after your first lesson and keep updating it as you progress rather than quoting a number and hoping.",
      },
      {
        q: "Can someone come along to watch?",
        a: "Lessons are one-to-one for insurance and safety reasons. If there is something specific behind the question, talk to us before you book and we will find a way to put your mind at rest.",
      },
    ],
  },
  {
    category: "Prices and payment",
    blurb: "What it costs and how you pay.",
    icon: "chart",
    questions: [
      {
        q: "How do I pay?",
        a: "Cash or bank transfer. Block bookings are paid upfront before the first lesson of the block.",
      },
      {
        q: "How long is a block booking valid?",
        a: "Prepaid blocks last three months from the day you buy them.",
      },
      {
        q: "What if I need to cancel?",
        a: "We ask for 48 hours notice where you can manage it. Cancellations inside 24 hours may be charged, since that slot is unlikely to be refilled. The full detail is in our terms and conditions.",
      },
      {
        q: "Is there an offer for new pupils?",
        a: "Yes - a discounted introductory block covering your first two lessons, in manual or automatic. It is the cheapest way to find out whether we are a good fit before committing to anything longer. Current prices are on the prices page.",
      },
    ],
  },
  {
    category: "The driving test",
    blurb: "Getting to test day and past it.",
    icon: "trophy",
    questions: [
      {
        q: "When am I ready to book my test?",
        a: "We will tell you when we think you are consistently driving to the standard. Don't let anyone push you into booking early - but equally, don't sit on it once you are there.",
      },
      {
        q: "Can I use the school car for my test?",
        a: "Yes, and we recommend it. We take you to the test centre as part of your lesson time, so you arrive warmed up in a car you already know rather than cold in an unfamiliar one.",
      },
      {
        q: "What happens if I fail?",
        a: "Plenty of people need more than one go, and it is not the disaster it feels like on the day. We go through the examiner's report with you, work on exactly what it flagged, and get you back in for a re-sit as soon as it is sensible.",
      },
      {
        q: "What is Pass Plus?",
        a: "A six-hour course you can take after passing, covering motorways, night driving, rural roads, dual carriageways and town driving. A lot of insurers knock money off a first-year premium for it, so it often pays for itself.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.flatMap((c) =>
    c.questions.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  ),
};

/** Accordion list. `tone` flips the palette for the light "paper" section. */
function Accordion({ items, tone }: { items: QA[]; tone: "dark" | "paper" }) {
  const dark = tone === "dark";
  const rule = dark ? "1px solid #24354f" : "1px solid rgba(7,13,24,0.14)";
  const qColor = dark ? "#eef2f9" : "#070d18";
  const aColor = dark ? "#94a5c0" : "#46566f";
  const markColor = dark ? "#f47c20" : "#070d18";

  return (
    <div>
      {items.map((item, i) => (
        <details key={item.q} style={{ borderTop: i === 0 ? rule : undefined, borderBottom: rule }}>
          <summary
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1.5rem",
              padding: "1.5rem 0",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontSize: "clamp(1.05rem, 2.2vw, 1.3rem)",
                color: qColor,
                lineHeight: 1.35,
              }}
            >
              {item.q}
            </span>
            <span
              className="chev"
              aria-hidden
              style={{
                flexShrink: 0,
                color: markColor,
                fontSize: "1.4rem",
                lineHeight: 1,
                marginTop: "0.15rem",
              }}
            >
              +
            </span>
          </summary>
          <p style={{ color: aColor, fontSize: "0.98rem", lineHeight: 1.75, margin: 0, padding: "0 0 1.75rem", maxWidth: "68ch" }}>
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}

function CategoryHead({ cat, index, tone }: { cat: Category; index: number; tone: "dark" | "paper" }) {
  const dark = tone === "dark";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", marginBottom: "2.5rem" }}>
      <span className="numeral" style={{ fontSize: "clamp(2.6rem, 7vw, 4.2rem)", color: dark ? "#1e2e4a" : "rgba(7,13,24,0.16)", lineHeight: 1 }}>
        {String(index).padStart(2, "0")}
      </span>
      <div>
        <h2 style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.9rem)", color: dark ? "#eef2f9" : "#070d18", marginBottom: "0.5rem" }}>
          {cat.category}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: dark ? "#63779a" : "#5a6b86",
            margin: 0,
          }}
        >
          {cat.blurb}
        </p>
      </div>
    </div>
  );
}

export default async function QA() {
  const [banner, contact] = await Promise.all([
    getBanner("/qa", getCmsPage("/qa")!.banner),
    getContactSettings(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section
        className={banner.imageUrl ? "spotlight" : "grid-bg spotlight"}
        style={{
          backgroundImage: bannerBg(banner, "linear-gradient(170deg, #101c30 0%, #070d18 70%)"),
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid #1c2b45",
        }}
      >
        <div
          className="max-w-[1240px] mx-auto px-5"
          style={{
            position: "relative",
            zIndex: 1,
            padding: "clamp(3.5rem, 9vw, 6.5rem) 1.25rem clamp(3rem, 7vw, 5rem)",
          }}
        >
          {banner.eyebrow && (
            <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>{banner.eyebrow}</p>
          )}
          <h1 style={{ fontSize: "clamp(2.4rem, 7vw, 4.75rem)", maxWidth: "16ch" }}>
            {banner.heading}
          </h1>
          {banner.subheading && (
            <p style={{ color: "#94a5c0", maxWidth: "56ch", marginTop: "1.5rem", fontSize: "1.02rem", lineHeight: 1.7 }}>
              {banner.subheading}
            </p>
          )}

          {/* Category jump pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginTop: "2.5rem" }}>
            {faqs.map((c) => (
              <span
                key={c.category}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "0.66rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#f47c20",
                  border: "1px solid rgba(244,124,32,0.3)",
                  borderRadius: "999px",
                  padding: "0.45rem 1rem",
                }}
              >
                <Icon name={c.icon} size={13} />
                {c.category}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 01 + 02 - void ══════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5" style={{ display: "grid", gap: "clamp(3.5rem, 8vw, 5.5rem)" }}>
          {faqs.slice(0, 2).map((cat, i) => (
            <div key={cat.category}>
              <CategoryHead cat={cat} index={i + 1} tone="dark" />
              <Accordion items={cat.questions} tone="dark" />
            </div>
          ))}
        </div>
      </section>

      {/* ══ 03 - paper ══════════════════════════════════════════ */}
      <section style={{ background: "#f4f6fa", color: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <CategoryHead cat={faqs[2]} index={3} tone="paper" />
          <Accordion items={faqs[2].questions} tone="paper" />
          <div style={{ paddingTop: "2.5rem" }}>
            <Link href="/prices" className="btn btn-dark">
              See the full price list
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 04 - ink ════════════════════════════════════════════ */}
      <section style={{ background: "#0d1728", padding: "clamp(4.5rem, 10vw, 7.5rem) 0", borderTop: "1px solid #1c2b45", borderBottom: "1px solid #1c2b45" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <CategoryHead cat={faqs[3]} index={4} tone="dark" />
          <Accordion items={faqs[3].questions} tone="dark" />
        </div>
      </section>

      {/* ══ CLOSING CTA ═════════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>NOT COVERED HERE</p>
          <h2 style={{ fontSize: "clamp(2.2rem, 6.5vw, 4.4rem)", marginBottom: "1.5rem", maxWidth: "16ch", marginInline: "auto" }}>
            ask us anything before you book
          </h2>
          <p style={{ color: "#94a5c0", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "48ch", margin: "0 auto 2.5rem" }}>
            There is no such thing as a daft question about learning to drive. Send it over and
            you&apos;ll get a straight answer, with no obligation to book anything.
          </p>
          <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/enquiry" className="btn btn-accent">
              Book your first lesson
              <span aria-hidden>→</span>
            </Link>
            {contact.phone ? (
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="btn btn-ghost bare">
                <Icon name="phone" size={17} />
                {contact.phone}
              </a>
            ) : (
              <Link href="/contact" className="btn btn-ghost">Get in touch</Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
