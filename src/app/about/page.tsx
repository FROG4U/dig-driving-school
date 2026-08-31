import type { Metadata } from "next";
import Link from "next/link";
import { getPageMetadata } from "@/lib/seo";
import { getBanner, bannerBg, getSection } from "@/lib/content";
import { getCmsPage } from "@/lib/cms-pages";
import { getSectionSchema } from "@/lib/cms-sections";
import { getContactSettings } from "@/lib/site-settings";
import { SITE } from "@/lib/site-config";
import Icon from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/about", {
    title: `About Us | DVSA-Approved Driving Instructor ${SITE.location}`,
    description: `Meet the team behind Dig Driving School in ${SITE.location}. Over 8 years of patient, structured tuition - manual and automatic lessons, 7 days a week.`,
  });
}

const qualifications = [
  "DVSA Approved Driving Instructor (ADI)",
  "Enhanced DBS checked",
  "Fully comprehensively insured",
  "First aid trained",
  "Continuing Professional Development kept current",
  "Theory Test Pro accredited partner",
];

const expectations = [
  {
    icon: "clipboard",
    title: "We assess before we teach",
    desc: "Your first session starts with an honest read of where you are, so nothing is pitched too high or too slow.",
  },
  {
    icon: "chart",
    title: "We build lesson on lesson",
    desc: "Every session picks up where the last one finished, following the DVSA learning framework rather than a random order.",
  },
  {
    icon: "chat",
    title: "We tell you the truth",
    desc: "You get clear, constructive feedback at the end of each lesson, so you always know what is solid and what still needs work.",
  },
];

export default async function About() {
  const [banner, photoSec, contact] = await Promise.all([
    getBanner("/about", getCmsPage("/about")!.banner),
    getSection("/about", "dig-photo", getSectionSchema("/about", "dig-photo")!.defaults),
    getContactSettings(),
  ]);

  const photo = photoSec.imageUrl as string;

  const stats = [
    { value: "8+", label: "Years teaching learners" },
    { value: "300+", label: "Pupils passed" },
    { value: "7", label: "Days a week available" },
    { value: "0", label: "Extra charge for evenings" },
  ];

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
            <Link href="/prices" className="btn btn-ghost">See prices</Link>
          </div>
        </div>
      </section>

      {/* ══ WHO WE ARE - split with photo ═══════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div
          className="max-w-[1240px] mx-auto px-5 grid gap-12 items-center"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
        >
          <div
            style={{
              borderRadius: "26px",
              overflow: "hidden",
              border: "1px solid #24354f",
              background: "#101c30",
              minHeight: "420px",
              position: "relative",
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt="Dig Driving School instructor"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", minHeight: "420px" }}
              />
            ) : (
              <div
                className="grid-bg"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.9rem",
                  color: "#35496a",
                }}
              >
                <Icon name="instructor" size={48} strokeWidth={1.2} />
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  Add a photo in admin
                </span>
              </div>
            )}
          </div>

          <div>
            <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>WHO WE ARE</p>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", marginBottom: "1.5rem" }}>
              the instructor behind the wheel
            </h2>
            <p style={{ color: "#94a5c0", fontSize: "1rem", lineHeight: 1.75, marginBottom: "1.15rem" }}>
              We have spent more than eight years teaching learner drivers across {SITE.location} and
              the surrounding area. In that time we have worked out what actually helps people pass:
              patience, structure, and a car that feels calm rather than tense.
            </p>
            <p style={{ color: "#94a5c0", fontSize: "1rem", lineHeight: 1.75, marginBottom: "1.15rem" }}>
              We shape every lesson around the person in the driver&apos;s seat - whether that&apos;s a
              complete beginner touching the controls for the first time, or someone with a test booked
              who needs to sharpen two or three specific things.
            </p>
            <p style={{ color: "#eef2f9", fontSize: "1rem", lineHeight: 1.75, marginBottom: "2.25rem" }}>
              We teach 7 days a week, evenings and weekends included, at no extra cost - and we&apos;ll
              collect you from home, work, college or school.
            </p>

            <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
              <Link href="/enquiry" className="btn btn-accent">
                Get in touch
                <span aria-hidden>→</span>
              </Link>
              <Link href="/lessons" className="btn btn-ghost">Our lessons</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CREDENTIALS - numbered rows on paper ════════════════ */}
      <section style={{ background: "#f4f6fa", color: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a6b86", marginBottom: "1.25rem" }}>
            CREDENTIALS
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", color: "#070d18", marginBottom: "3rem", maxWidth: "18ch" }}>
            qualified, checked and insured
          </h2>

          <div>
            {qualifications.map((q, i) => (
              <div
                key={q}
                className="grid gap-6 items-center"
                style={{
                  gridTemplateColumns: "minmax(0, auto) minmax(0, 1fr)",
                  borderTop: "1px solid rgba(7,13,24,0.14)",
                  padding: "1.5rem 0",
                }}
              >
                <span className="numeral" style={{ fontSize: "clamp(2.2rem, 6vw, 3.6rem)", color: "rgba(7,13,24,0.16)", minWidth: "2.2ch" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "clamp(1.05rem, 2.4vw, 1.35rem)", color: "#070d18", fontWeight: 500, lineHeight: 1.4 }}>
                  {q}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(7,13,24,0.14)", paddingTop: "2.5rem" }}>
            <Link href="/enquiry" className="btn btn-dark">
              Book with a qualified instructor
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ STATS ═══════════════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4rem, 8vw, 6rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p className="eyebrow" style={{ marginBottom: "2.5rem" }}>BY THE NUMBERS</p>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
            {stats.map((s) => (
              <div key={s.label} style={{ borderTop: "1px solid #24354f", paddingTop: "1.5rem" }}>
                <div className="numeral" style={{ fontSize: "clamp(2.6rem, 6vw, 3.6rem)", color: "#f47c20", marginBottom: "0.6rem" }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#94a5c0", lineHeight: 1.5 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHAT TO EXPECT ══════════════════════════════════════ */}
      <section style={{ background: "#0d1728", padding: "clamp(4.5rem, 10vw, 7.5rem) 0", borderTop: "1px solid #1c2b45", borderBottom: "1px solid #1c2b45" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>HOW WE TEACH</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", marginBottom: "3.25rem", maxWidth: "20ch" }}>
            what to expect from your lessons
          </h2>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            {expectations.map((item, i) => (
              <div key={item.title} className="card card-accent" style={{ padding: "2rem 1.75rem" }}>
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
                    <Icon name={item.icon} size={21} />
                  </span>
                  <span className="numeral" style={{ color: "#1e2e4a", fontSize: "2.4rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.28rem", marginBottom: "0.7rem" }}>{item.title}</h3>
                <p style={{ color: "#94a5c0", fontSize: "0.92rem", lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CLOSING CTA ═════════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>READY WHEN YOU ARE</p>
          <h2 style={{ fontSize: "clamp(2.2rem, 6.5vw, 4.4rem)", marginBottom: "1.5rem", maxWidth: "16ch", marginInline: "auto" }}>
            let&apos;s get you started
          </h2>
          <p style={{ color: "#94a5c0", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "48ch", margin: "0 auto 2.5rem" }}>
            Tell us where you are with your driving and we&apos;ll tell you honestly what it will take
            to get you test-ready.
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
