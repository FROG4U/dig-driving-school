import type { Metadata } from "next";
import Link from "next/link";
import { getPageMetadata } from "@/lib/seo";
import { getBanner, bannerBg } from "@/lib/content";
import { getCmsPage } from "@/lib/cms-pages";
import { SITE } from "@/lib/site-config";
import Icon from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/theory-test", {
    title: `Theory Test Help ${SITE.location} | ${SITE.name}`,
    description: `Everything you need to pass the DVSA theory test first time — how the multiple choice and hazard perception sections work, what the pass marks are, and how we help our pupils in ${SITE.location} revise.`,
  });
}

const facts: [string, string][] = [
  ["Cost", "£23"],
  ["Multiple choice", "50 questions — pass mark 43"],
  ["Hazard perception", "14 clips — pass mark 44 of 75"],
  ["Total duration", "Around 57 minutes"],
  ["Certificate valid for", "2 years"],
  ["Minimum age", "17"],
];

const topics = [
  {
    icon: "book",
    title: "Multiple choice questions",
    desc: "The full DVSA question bank, sorted by topic. Every question is official and updates itself as the bank changes.",
  },
  {
    icon: "target",
    title: "Hazard perception",
    desc: "Video clips with instant feedback, in exactly the format you will meet on the day — including the anti-cheat scoring.",
  },
  {
    icon: "clipboard",
    title: "Highway Code",
    desc: "The whole Highway Code built in, with explanations and short quizzes so it actually sticks rather than washing over you.",
  },
  {
    icon: "check-circle",
    title: "Mock tests",
    desc: "Full timed mocks combining both sections, so the real thing feels like something you have already done.",
  },
  {
    icon: "chart",
    title: "Progress tracking",
    desc: "Your scores broken down by topic, so your revision goes where it is needed instead of where it is comfortable.",
  },
  {
    icon: "phone",
    title: "Any device",
    desc: "Phone, tablet or laptop. Nothing to install — log in on the bus and get ten minutes done.",
  },
];

const tips = [
  {
    tip: "Start earlier than feels necessary",
    detail: "A few weeks of short, regular sessions beats a panicked weekend every time. The questions reward familiarity, not cramming.",
  },
  {
    tip: "Read the Highway Code properly",
    detail: "A large share of questions come straight out of it. Read it cover to cover once, then dip back in whenever a mock catches you out.",
  },
  {
    tip: "Treat hazard perception as its own skill",
    detail: "It has a technique. Click the moment a hazard starts developing, not when it is obvious — and do not spam clicks, the system zeroes the clip.",
  },
  {
    tip: "Only use official material",
    detail: "Stick to DVSA-approved question banks. Unofficial ones drift out of date and will teach you answers that are no longer right.",
  },
  {
    tip: "Book the test before you feel ready",
    detail: "A date in the diary is the single best motivator we know. Most pupils revise twice as hard the week the booking lands.",
  },
];

export default async function TheoryTest() {
  const banner = await getBanner("/theory-test", getCmsPage("/theory-test")!.banner);

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
          <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginTop: "2.5rem" }}>
            <Link href="/enquiry" className="btn btn-accent">
              Get set up for theory
              <span aria-hidden>→</span>
            </Link>
            <Link href="/useful-links" className="btn btn-ghost">Book it on GOV.UK</Link>
          </div>
        </div>
      </section>

      {/* ══ WHAT THE TEST IS ════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div
          className="max-w-[1240px] mx-auto px-5 grid gap-12 items-start"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))" }}
        >
          <div>
            <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>THE FORMAT</p>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", marginBottom: "1.75rem" }}>
              two halves, one sitting
            </h2>
            <p style={{ color: "#94a5c0", fontSize: "1rem", lineHeight: 1.75, marginBottom: "1.25rem" }}>
              The DVSA theory test is a multiple choice section — 50 questions, 43 to pass — followed
              by hazard perception, which is 14 video clips scored out of 75 with a pass mark of 44.
              You have to clear both in the same appointment; passing one and failing the other means
              sitting the whole thing again.
            </p>
            <p style={{ color: "#94a5c0", fontSize: "1rem", lineHeight: 1.75, marginBottom: "1.25rem" }}>
              Your pass certificate lasts two years. If your practical has not happened by then the
              certificate expires and the theory goes back on your to-do list, so we would rather you
              got it done early and kept the clock on your side.
            </p>
            <p style={{ color: "#94a5c0", fontSize: "1rem", lineHeight: 1.75, marginBottom: "2.25rem" }}>
              Our advice is simple: book it near the start of your lessons and revise little and often.
              Theory and practical reinforce each other — the road signs make far more sense once you
              have driven past a few of them.
            </p>
            <Link href="/enquiry" className="btn btn-ghost">Ask us about revision</Link>
          </div>

          {/* At a glance panel */}
          <div
            style={{
              background: "rgba(23,23,29,0.72)",
              border: "1px solid #24354f",
              borderRadius: "26px",
              padding: "2rem",
            }}
          >
            <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#63779a", marginBottom: "1.75rem" }}>
              At a glance
            </p>
            {facts.map(([label, value], i) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "1.5rem",
                  padding: "0.95rem 0",
                  borderTop: i === 0 ? "none" : "1px solid #24354f",
                }}
              >
                <span style={{ color: "#94a5c0", fontSize: "0.86rem" }}>{label}</span>
                <span style={{ color: "#eef2f9", fontSize: "0.9rem", fontWeight: 600, textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ THEORY TEST PRO ═════════════════════════════════════ */}
      <section style={{ background: "#0d1728", padding: "clamp(4.5rem, 10vw, 7.5rem) 0", borderTop: "1px solid #1c2b45", borderBottom: "1px solid #1c2b45" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3.5rem" }}>
            <div style={{ maxWidth: "34ch" }}>
              <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>INCLUDED WITH INTENSIVE COURSES</p>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>theory test pro</h2>
            </div>
            <p style={{ color: "#94a5c0", maxWidth: "42ch", fontSize: "1rem", lineHeight: 1.7 }}>
              Our intensive course pupils get free access to Theory Test Pro — the online prep
              platform built on the official DVSA bank and used by driving schools nationwide.
            </p>
          </div>

          {/* Headline stat */}
          <div
            style={{
              background: "#f47c20",
              color: "#070d18",
              borderRadius: "26px",
              padding: "clamp(2rem, 5vw, 3rem)",
              marginBottom: "2.5rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "2rem",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
              <span className="numeral" style={{ fontSize: "clamp(3.4rem, 10vw, 6rem)", lineHeight: 1 }}>82%</span>
              <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                pass first time
              </span>
            </div>
            <p style={{ fontSize: "1rem", lineHeight: 1.6, maxWidth: "34ch", margin: 0 }}>
              That is the figure for pupils revising on Theory Test Pro, against a UK average of 41%.
            </p>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            {topics.map((t, i) => (
              <div key={t.title} className="card card-accent" style={{ padding: "2rem 1.75rem" }}>
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
                    <Icon name={t.icon} size={21} />
                  </span>
                  <span className="numeral" style={{ color: "#1e2e4a", fontSize: "2.4rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.28rem", marginBottom: "0.7rem" }}>{t.title}</h3>
                <p style={{ color: "#94a5c0", fontSize: "0.92rem", lineHeight: 1.65 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TIPS — numbered rows on paper ═══════════════════════ */}
      <section style={{ background: "#f4f6fa", color: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a6b86", marginBottom: "1.25rem" }}>
            HOW TO PASS IT
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", color: "#070d18", marginBottom: "3.5rem", maxWidth: "18ch" }}>
            five things that actually move the needle
          </h2>

          <div>
            {tips.map((item, i) => (
              <div
                key={item.tip}
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
                  <h3 style={{ fontSize: "clamp(1.35rem, 3vw, 1.9rem)", color: "#070d18" }}>{item.tip}</h3>
                  <p style={{ color: "#46566f", fontSize: "0.98rem", lineHeight: 1.7 }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(7,13,24,0.14)", paddingTop: "2.5rem" }}>
            <Link href="/useful-links" className="btn btn-dark">
              Official booking and revision links
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ CLOSING CTA ═════════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>GET THEORY DONE</p>
          <h2 style={{ fontSize: "clamp(2.2rem, 6.5vw, 4.4rem)", marginBottom: "1.5rem", maxWidth: "16ch", marginInline: "auto" }}>
            pass the theory, keep the momentum
          </h2>
          <p style={{ color: "#94a5c0", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "48ch", margin: "0 auto 2.5rem" }}>
            Theory Test Pro access comes free with our intensive courses, and we will point any pupil
            at the right revision whether they are on a course or not. Ask and it&apos;s yours.
          </p>
          <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/enquiry" className="btn btn-accent">
              Ask about Theory Test Pro
              <span aria-hidden>→</span>
            </Link>
            <Link href="/prices" className="btn btn-ghost">See course prices</Link>
          </div>
        </div>
      </section>
    </>
  );
}
