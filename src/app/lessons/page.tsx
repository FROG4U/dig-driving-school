import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { getPageMetadata } from "@/lib/seo";
import { getBanner, bannerBg } from "@/lib/content";
import { getCmsPage } from "@/lib/cms-pages";
import { getContactSettings } from "@/lib/site-settings";
import { SITE } from "@/lib/site-config";

// This page had no metadata export at all, so it inherited the generic site
// title and ignored its own SEO record - the same stale "orphaned page"
// assumption that had also kept it out of the sitemap.
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/lessons", {
    title: `Driving Lessons in ${SITE.location} | Manual & Automatic`,
    description: `Manual and automatic driving lessons in ${SITE.location} with a DVSA-approved instructor. Hourly lessons, 10-hour blocks, refresher courses and theory test support.`,
  });
}

const packages = [
  {
    name: "Manual lesson",
    price: "£35",
    unit: "per hour",
    icon: "wrench",
    popular: true,
    features: ["Full-control manual car", "1 or 2-hour sessions", "Move at your own pace", "Full feedback every time"],
  },
  {
    name: "Automatic lesson",
    price: "£40",
    unit: "per hour",
    icon: "automatic",
    features: ["No clutch, no gears", "Focus on road skills", "1 or 2-hour sessions", "Full feedback every time"],
  },
  {
    name: "Manual 10-hour block",
    price: "£360",
    unit: "block booking",
    icon: "calendar",
    features: ["10 hours pre-paid", "Valid for 3 months", "Book the slots that suit you", "Progress tracked throughout"],
  },
  {
    name: "Automatic 10-hour block",
    price: "£400",
    unit: "block booking",
    icon: "calendar",
    features: ["10 hours pre-paid", "Valid for 3 months", "Book the slots that suit you", "Progress tracked throughout"],
  },
];

const addOns = [
  {
    name: "Refresher & returning drivers",
    price: "Hourly rate",
    desc: "Coming back to the road after a break, or want to build confidence at higher speeds? Book refresher sessions at the standard manual or automatic hourly rate.",
  },
  {
    name: "Theory test preparation",
    price: "Included",
    desc: "We walk you through how to prepare for the theory test and hazard perception, and share resources and tips as part of your lessons.",
  },
];

const faqs = [
  {
    q: "How many lessons will I need?",
    a: "It genuinely varies. The DVSA average is around 45 hours, and plenty of people land either side of that. We&rsquo;ll give you an honest estimate after your first lesson and update it as you progress.",
  },
  {
    q: "What areas do you cover?",
    a: `We are based in ${SITE.location} and teach across the town and the immediate surrounding area. If you are not sure whether we reach you, just ask.`,
  },
  {
    q: "Can I choose when my lessons are?",
    a: "Yes. Lessons run Monday to Saturday including evenings, subject to availability. Get in touch and we&rsquo;ll tell you which slots are open.",
  },
  {
    q: "Do I need my provisional licence before starting?",
    a: "Yes. You need a valid UK provisional driving licence in hand before your first lesson.",
  },
];

export default async function Lessons() {
  const [banner, contact] = await Promise.all([
    getBanner("/lessons", getCmsPage("/lessons")!.banner),
    getContactSettings(),
  ]);

  return (
    <>
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
            padding: "clamp(3.5rem, 9vw, 6.5rem) 1.25rem clamp(3rem, 7vw, 5.5rem)",
          }}
        >
          {banner.eyebrow && (
            <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>{banner.eyebrow}</p>
          )}
          <h1 style={{ fontSize: "clamp(2.7rem, 7.5vw, 5.4rem)", maxWidth: "15ch" }}>
            {banner.heading}
          </h1>
          {banner.subheading && (
            <p style={{ color: "#94a5c0", maxWidth: "54ch", marginTop: "1.75rem", fontSize: "1.05rem", lineHeight: 1.7 }}>
              {banner.subheading}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginTop: "2.5rem" }}>
            <Link href="/enquiry" className="btn btn-accent">
              Book your first lesson
              <span aria-hidden>→</span>
            </Link>
            <Link href="/prices" className="btn btn-ghost">Full price list</Link>
          </div>
        </div>
      </section>

      {/* ══ LESSON TYPES ════════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3.5rem" }}>
            <div style={{ maxWidth: "34ch" }}>
              <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>WAYS TO LEARN</p>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>pick the shape that fits you</h2>
            </div>
            <p style={{ color: "#94a5c0", maxWidth: "42ch", fontSize: "1rem", lineHeight: 1.7 }}>
              Take it hour by hour, or book a 10-hour block - in a manual or automatic car. Every
              option includes door-to-door pick-up from wherever you are.
            </p>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            {packages.map((p, i) => (
              <div
                key={p.name}
                className="card card-accent"
                style={{
                  padding: "2rem 1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  borderColor: p.popular ? "rgba(244,124,32,0.45)" : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <span
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "14px",
                      background: "rgba(47,122,224,0.14)",
                      border: "1px solid rgba(47,122,224,0.3)",
                      color: "#6aa6f5",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={p.icon} size={21} />
                  </span>
                  <span className="numeral" style={{ color: "#1e2e4a", fontSize: "2.4rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {p.popular && (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.62rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#f47c20",
                      border: "1px solid rgba(244,124,32,0.3)",
                      borderRadius: "999px",
                      padding: "0.3rem 0.8rem",
                      marginBottom: "0.9rem",
                    }}
                  >
                    Most popular
                  </span>
                )}

                <h3 style={{ fontSize: "1.28rem", marginBottom: "0.9rem" }}>{p.name}</h3>
                <div className="numeral" style={{ fontSize: "2.2rem", color: "#eef2f9", marginBottom: "0.5rem" }}>
                  {p.price}
                </div>
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#63779a", marginBottom: "1.5rem" }}>
                  {p.unit}
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.7rem", flex: 1 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                      <span style={{ color: "#f47c20", flexShrink: 0, marginTop: "1px", display: "inline-flex" }}>
                        <Icon name="check" size={15} strokeWidth={2.2} />
                      </span>
                      <span style={{ color: "#94a5c0", fontSize: "0.9rem", lineHeight: 1.5 }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ADD-ONS - numbered rows on paper ════════════════════ */}
      <section style={{ background: "#f4f6fa", color: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a6b86", marginBottom: "1.25rem" }}>
            ALSO AVAILABLE
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", color: "#070d18", marginBottom: "3.25rem", maxWidth: "18ch" }}>
            everything else we teach
          </h2>

          <div>
            {addOns.map((a, i) => (
              <div
                key={a.name}
                className="grid gap-6 items-start"
                style={{
                  gridTemplateColumns: "minmax(0, auto) minmax(0, 1fr)",
                  borderTop: "1px solid rgba(7,13,24,0.14)",
                  padding: "2rem 0",
                }}
              >
                <span className="numeral" style={{ fontSize: "clamp(2.6rem, 7vw, 4.5rem)", color: "rgba(7,13,24,0.16)", minWidth: "2.2ch" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="grid gap-3 md:grid-cols-2 md:gap-10 items-start">
                  <div>
                    <h3 style={{ fontSize: "clamp(1.35rem, 3vw, 1.9rem)", color: "#070d18", marginBottom: "0.75rem" }}>
                      {a.name}
                    </h3>
                    <span
                      style={{
                        display: "inline-block",
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: "0.7rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#070d18",
                        border: "1px solid rgba(7,13,24,0.22)",
                        borderRadius: "999px",
                        padding: "0.35rem 0.9rem",
                      }}
                    >
                      {a.price}
                    </span>
                  </div>
                  <p style={{ color: "#46566f", fontSize: "0.98rem", lineHeight: 1.7 }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(7,13,24,0.14)", paddingTop: "2.5rem" }}>
            <Link href="/enquiry" className="btn btn-dark">
              Ask about a session
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FAQs ════════════════════════════════════════════════ */}
      <section style={{ background: "#0d1728", padding: "clamp(4.5rem, 10vw, 7.5rem) 0", borderTop: "1px solid #1c2b45", borderBottom: "1px solid #1c2b45" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>GOOD TO KNOW</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", marginBottom: "3rem", maxWidth: "20ch" }}>
            questions we get asked most
          </h2>

          <div style={{ maxWidth: "820px" }}>
            {faqs.map((item) => (
              <details key={item.q} style={{ borderTop: "1px solid #24354f", padding: "1.4rem 0" }}>
                <summary style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
                  <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, letterSpacing: "-0.03em", fontSize: "clamp(1.05rem, 2.4vw, 1.3rem)", color: "#eef2f9" }}>
                    {item.q}
                  </span>
                  <span className="chev" style={{ color: "#f47c20", flexShrink: 0, fontSize: "1.4rem", lineHeight: 1 }} aria-hidden>
                    +
                  </span>
                </summary>
                <p
                  style={{ color: "#94a5c0", fontSize: "0.97rem", lineHeight: 1.7, marginTop: "1rem", maxWidth: "62ch" }}
                  dangerouslySetInnerHTML={{ __html: item.a }}
                />
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CLOSING CTA ═════════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>NEXT STEP</p>
          <h2 style={{ fontSize: "clamp(2.2rem, 6.5vw, 4.4rem)", marginBottom: "1.5rem", maxWidth: "16ch", marginInline: "auto" }}>
            reserve your first lesson
          </h2>
          <p style={{ color: "#94a5c0", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "48ch", margin: "0 auto 2.5rem" }}>
            Send us a few details and we&apos;ll come back with the slots we have free and what we&apos;d
            recommend starting with.
          </p>
          <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/enquiry" className="btn btn-accent">
              Book a lesson
              <span aria-hidden>→</span>
            </Link>
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="btn btn-ghost bare">
                <Icon name="phone" size={17} />
                {contact.phone}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
