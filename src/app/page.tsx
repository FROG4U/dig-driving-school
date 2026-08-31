import type { Metadata } from "next";
import Link from "next/link";
import { getPageMetadata } from "@/lib/seo";
import { getBanner, bannerBg, getSection } from "@/lib/content";
import { getCmsPage } from "@/lib/cms-pages";
import { getSectionSchema } from "@/lib/cms-sections";
import { SITE } from "@/lib/site-config";
import Icon from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/", {
    title: "Dig Driving School | DVSA-Approved Driving Instructor",
    description:
      "Manual and automatic driving lessons with a DVSA-approved instructor. Door-to-door pick-up 7 days a week, honest pricing, and a focus on passing first time.",
  });
}

// Scrolling strip under the hero - pure decoration, no CMS needed.
const marqueeWords = [
  "manual & automatic",
  "dvsa approved",
  "7 days a week",
  "door-to-door pick-up",
  "block booking discounts",
  "mock tests included",
];

export default async function Home() {
  const [banner, servicesSec, processSec, statsSec, aboutSec, testimonialsSec, ctaSec, seoSec] =
    await Promise.all([
      getBanner("/", getCmsPage("/")!.banner),
      getSection("/", "services", getSectionSchema("/", "services")!.defaults),
      getSection("/", "process", getSectionSchema("/", "process")!.defaults),
      getSection("/", "stats", getSectionSchema("/", "stats")!.defaults),
      getSection("/", "about", getSectionSchema("/", "about")!.defaults),
      getSection("/", "testimonials", getSectionSchema("/", "testimonials")!.defaults),
      getSection("/", "cta", getSectionSchema("/", "cta")!.defaults),
      getSection("/", "seo", getSectionSchema("/", "seo")!.defaults),
    ]);

  const services: { icon: string; title: string; desc: string }[] = servicesSec.items ?? [];
  const steps: { title: string; desc: string }[] = processSec.items ?? [];
  const stats: { value: string; label: string }[] = statsSec.items ?? [];
  const testimonials: { initials: string; name: string; location: string; quote: string }[] =
    testimonialsSec.items ?? [];

  const heroImage = banner.imageUrl;
  const aboutImage = aboutSec.imageUrl as string;

  return (
    <>
      {/* ══ HERO - full-bleed photo, left copy, stats bar at foot ══ */}
      <section
        className={heroImage ? "" : "grid-bg spotlight"}
        style={{
          backgroundImage: bannerBg(banner, "linear-gradient(170deg, #101c30 0%, #070d18 70%)"),
          backgroundSize: "cover",
          backgroundPosition: "center right",
          position: "relative",
          overflow: "hidden",
          marginTop: "-76px",
          paddingTop: "76px",
          minHeight: "clamp(560px, 90vh, 860px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Copy - vertically centred in the space above the stats bar */}
        <div
          className="max-w-[1240px] mx-auto px-5"
          style={{
            width: "100%",
            position: "relative",
            zIndex: 1,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(3rem, 8vw, 5rem) 1.25rem clamp(2.5rem, 5vw, 3.5rem)",
          }}
        >
          <div style={{ maxWidth: "640px" }}>
            <p className="eyebrow" style={{ marginBottom: "1.75rem" }}>{banner.eyebrow}</p>

            <h1 style={{ fontSize: "clamp(2.7rem, 7.5vw, 5.4rem)", marginBottom: "1.75rem" }}>
              {banner.heading}
            </h1>

            <p style={{ fontSize: "1.08rem", color: "#c3ccdb", maxWidth: "50ch", lineHeight: 1.7, marginBottom: "2.5rem" }}>
              {banner.subheading}
            </p>

            <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              <Link href="/enquiry" className="btn btn-accent">
                Book your first lesson
                <span aria-hidden>→</span>
              </Link>
              <Link href="/prices" className="btn btn-ghost">See prices</Link>
            </div>

            {/* Trust row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ display: "flex", gap: "2px", color: "#f47c20" }}>
                  {[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" size={15} />)}
                </span>
                <span style={{ fontSize: "0.85rem", color: "#c3ccdb" }}>Rated by local learners</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#c3ccdb" }}>
                <span style={{ color: "#f47c20", display: "inline-flex" }}><Icon name="shield" size={16} /></span>
                DVSA approved
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar - full width along the foot of the hero */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            borderTop: "1px solid #24354f",
            background: "rgba(7,13,24,0.55)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="max-w-[1240px] mx-auto px-5">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="stat-cell" style={{ padding: "1.5rem 1.35rem" }}>
                  <div className="numeral" style={{ fontSize: "clamp(1.85rem, 4vw, 2.5rem)", color: "#f47c20", marginBottom: "0.4rem" }}>
                    {s.value}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a5c0" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE STRIP ═══════════════════════════════════════ */}
      <div
        style={{
          background: "#f47c20",
          color: "#070d18",
          overflow: "hidden",
          padding: "0.85rem 0",
          borderTop: "1px solid #070d18",
          borderBottom: "1px solid #070d18",
        }}
      >
        <div className="marquee-track">
          {[0, 1].map((rep) => (
            <div key={rep} style={{ display: "flex", flexShrink: 0 }} aria-hidden={rep === 1}>
              {marqueeWords.map((w) => (
                <span
                  key={w}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "1.75rem",
                    padding: "0 1.75rem",
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.76rem",
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {w}
                  <span style={{ opacity: 0.45 }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ LOCAL SEO BLURB - intro directly under the hero ═════ */}
      <section style={{ background: "#f4f6fa", color: "#070d18", padding: "clamp(4.5rem, 10vw, 7rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#c2610f", marginBottom: "1.25rem" }}>
            {seoSec.eyebrow}
          </p>
          <h2 style={{ fontSize: "clamp(1.9rem, 4.5vw, 3rem)", color: "#070d18", maxWidth: "20ch", marginBottom: "2.25rem" }}>
            {seoSec.heading}
          </h2>

          <div className="grid gap-8 md:gap-12" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <p style={{ color: "#46566f", fontSize: "1rem", lineHeight: 1.8 }}>{seoSec.body}</p>
            <p style={{ color: "#46566f", fontSize: "1rem", lineHeight: 1.8 }}>{seoSec.body2}</p>
          </div>

          {/* Areas we cover - a strong local-SEO signal, driven by site-config */}
          <div style={{ marginTop: "2.75rem", paddingTop: "2.25rem", borderTop: "1px solid rgba(7,13,24,0.12)" }}>
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a6b86", marginBottom: "1rem" }}>
              Areas we cover
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
              {[SITE.location, ...SITE.nearbyTowns].map((place) => (
                <span
                  key={place}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(7,13,24,0.16)",
                    background: "#ffffff",
                    padding: "0.5rem 0.95rem",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: "#1c2b45",
                  }}
                >
                  <span style={{ color: "#f47c20", display: "inline-flex" }}><Icon name="pin" size={13} /></span>
                  {place}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ════════════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3.5rem" }}>
            <div style={{ maxWidth: "34ch" }}>
              <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>{servicesSec.eyebrow}</p>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>{servicesSec.heading}</h2>
            </div>
            <p style={{ color: "#94a5c0", maxWidth: "42ch", fontSize: "1rem", lineHeight: 1.7 }}>
              {servicesSec.subtext}
            </p>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            {services.map((s, i) => (
              <div key={s.title} className="card card-accent" style={{ padding: "2rem 1.75rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <span
                    style={{
                      width: "46px", height: "46px", borderRadius: "14px",
                      background: "rgba(47,122,224,0.14)",
                      border: "1px solid rgba(47,122,224,0.3)",
                      color: "#6aa6f5",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Icon name={s.icon} size={21} />
                  </span>
                  <span className="numeral" style={{ color: "#1e2e4a", fontSize: "2.4rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.28rem", marginBottom: "0.7rem" }}>{s.title}</h3>
                <p style={{ color: "#94a5c0", fontSize: "0.92rem", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROCESS - numbered rows on paper ════════════════════ */}
      <section style={{ background: "#f4f6fa", color: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a6b86", marginBottom: "1.25rem" }}>
            {processSec.eyebrow}
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", color: "#070d18", marginBottom: "3.5rem", maxWidth: "18ch" }}>
            {processSec.heading}
          </h2>

          <div>
            {steps.map((step, i) => (
              <div
                key={step.title}
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
                  <h3 style={{ fontSize: "clamp(1.35rem, 3vw, 1.9rem)", color: "#070d18" }}>{step.title}</h3>
                  <p style={{ color: "#46566f", fontSize: "0.98rem", lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(7,13,24,0.14)", paddingTop: "2.5rem" }}>
            <Link href="/enquiry" className="btn btn-dark">
              Start step one
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ ABOUT SPLIT ═════════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div
          className="max-w-[1240px] mx-auto px-5 grid gap-12 items-center"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
        >
          <div>
            <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>WHY DIG</p>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", marginBottom: "1.5rem" }}>
              taught by someone who remembers being nervous
            </h2>
            <p style={{ color: "#94a5c0", fontSize: "1rem", lineHeight: 1.75, marginBottom: "1.25rem" }}>
              Plenty of instructors can teach you to operate a car. The harder part is teaching you
              to trust yourself on a busy roundabout at 8am - and that only happens when lessons
              are calm, structured and honest about what still needs work.
            </p>
            <p style={{ color: "#94a5c0", fontSize: "1rem", lineHeight: 1.75, marginBottom: "2.25rem" }}>
              Every pupil gets a plan, clear feedback after each session, and no pressure to book
              a test before they&apos;re genuinely ready for it.
            </p>

            <div style={{ display: "grid", gap: "0.9rem", marginBottom: "2.25rem" }}>
              {[
                "Fully qualified, DVSA-approved instruction",
                "Dual-controlled, fully insured modern car",
                "Progress tracked and shared after every lesson",
                "No pressure to book a test before you're ready",
              ].map((point) => (
                <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <span style={{ color: "#f47c20", flexShrink: 0, marginTop: "1px" }}><Icon name="check-circle" size={18} /></span>
                  <span style={{ color: "#eef2f9", fontSize: "0.94rem", lineHeight: 1.5 }}>{point}</span>
                </div>
              ))}
            </div>

            <Link href="/about" className="btn btn-ghost">More about us</Link>
          </div>

          {/* Photo / placeholder */}
          <div
            style={{
              borderRadius: "26px",
              overflow: "hidden",
              border: "1px solid #24354f",
              background: "#101c30",
              minHeight: "380px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {aboutImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={aboutImage} alt="Dig Driving School instructor" style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: "380px" }} />
            ) : (
              <div className="grid-bg" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.85rem", color: "#35496a" }}>
                <Icon name="car" size={44} />
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  Add a photo in admin
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════ */}
      <section style={{ background: "#0d1728", padding: "clamp(4.5rem, 10vw, 7.5rem) 0", borderTop: "1px solid #1c2b45", borderBottom: "1px solid #1c2b45" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>{testimonialsSec.eyebrow}</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", marginBottom: "3.25rem", maxWidth: "20ch" }}>
            {testimonialsSec.heading}
          </h2>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            {testimonials.map((t) => (
              <figure key={t.name} className="card" style={{ padding: "2rem 1.75rem", margin: 0, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "2px", color: "#f47c20", marginBottom: "1.25rem" }}>
                  {[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" size={15} />)}
                </div>
                <blockquote style={{ margin: 0, color: "#eef2f9", fontSize: "1rem", lineHeight: 1.7, flex: 1 }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "1.75rem", paddingTop: "1.5rem", borderTop: "1px solid #24354f" }}>
                  <span
                    style={{
                      width: "40px", height: "40px", borderRadius: "999px",
                      background: "rgba(47,122,224,0.14)", color: "#f47c20",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: "0.82rem",
                      flexShrink: 0,
                    }}
                  >
                    {t.initials}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
                    <span style={{ color: "#eef2f9", fontWeight: 600, fontSize: "0.9rem" }}>{t.name}</span>
                    <span style={{ color: "#63779a", fontSize: "0.78rem", fontFamily: "var(--font-mono), monospace" }}>{t.location}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CLOSING CTA ═════════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>{ctaSec.eyebrow}</p>
          <h2 style={{ fontSize: "clamp(2.2rem, 6.5vw, 4.4rem)", marginBottom: "1.5rem", maxWidth: "16ch", marginInline: "auto" }}>
            {ctaSec.heading}
          </h2>
          <p style={{ color: "#94a5c0", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "48ch", margin: "0 auto 1rem" }}>
            {ctaSec.text}
          </p>
          {ctaSec.offer && (
            <p
              style={{
                display: "inline-block",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.78rem",
                letterSpacing: "0.1em",
                color: "#f47c20",
                border: "1px solid rgba(244,124,32,0.3)",
                borderRadius: "999px",
                padding: "0.5rem 1.15rem",
                marginBottom: "2.5rem",
              }}
            >
              {ctaSec.offer}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/enquiry" className="btn btn-accent">
              Book your first lesson
              <span aria-hidden>→</span>
            </Link>
            <Link href="/contact" className="btn btn-ghost">Ask a question</Link>
          </div>
        </div>
      </section>
    </>
  );
}
