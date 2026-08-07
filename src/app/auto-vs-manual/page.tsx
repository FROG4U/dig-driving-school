import type { Metadata } from "next";
import Link from "next/link";
import { getPageMetadata } from "@/lib/seo";
import { getBanner, bannerBg } from "@/lib/content";
import { getCmsPage } from "@/lib/cms-pages";
import { SITE } from "@/lib/site-config";
import Icon from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/auto-vs-manual", {
    title: `Automatic vs Manual Driving Lessons ${SITE.location} | ${SITE.name}`,
    description: `Automatic or manual? We break down what each licence covers, what each one costs you in time and money, and how to pick the one that fits. Both taught across ${SITE.location} and the surrounding area.`,
  });
}

type Column = {
  key: string;
  icon: string;
  name: string;
  licence: string;
  tagline: string;
  pros: string[];
  cons: string[];
};

const columns: Column[] = [
  {
    key: "manual",
    icon: "wrench",
    name: "Manual",
    licence: "Full licence — manual and automatic",
    tagline: "The one that keeps every door open.",
    pros: [
      "Your licence covers both manual and automatic cars",
      "Manual cars are generally cheaper to buy and to run",
      "A far bigger choice on the second-hand market",
      "More control over the car on hills and rural roads",
      "A genuine skill, and a satisfying one to master",
    ],
    cons: [
      "More to learn at once — clutch, gears and biting point",
      "The first few lessons can feel busier for some learners",
      "Most people need a few more hours to reach test standard",
    ],
  },
  {
    key: "automatic",
    icon: "automatic",
    name: "Automatic",
    licence: "Automatic-only licence",
    tagline: "The one that gets you focused on the road faster.",
    pros: [
      "Nothing to coordinate — no clutch, no gear changes",
      "More headspace for road awareness and hazard planning",
      "Plenty of learners get to test standard in fewer hours",
      "Often the right call if a disability or mobility issue is a factor",
      "Modern automatics are smooth and genuinely nice to drive",
    ],
    cons: [
      "Automatic-only — you cannot legally drive a manual on it",
      "Lessons and the cars themselves usually cost a little more",
      "Fewer automatics at the cheap end of the used market",
    ],
  },
];

const advice = [
  {
    q: "Which one should we put you in?",
    a: "For most people manual is the better long-term bet, simply because it leaves every option open afterwards. But if the coordination side is a real struggle, or you need to be on the road quickly, automatic is a completely legitimate choice — not a shortcut.",
  },
  {
    q: "Does manual actually take longer?",
    a: "It depends entirely on the person. Some pupils take to gears immediately; others do far better once the clutch stops competing for their attention. On average automatic learners need slightly fewer hours, but we have seen it go the other way plenty of times.",
  },
  {
    q: "Can you switch part way through?",
    a: "You can, and we will happily move you across if it is clearly the right thing. Just be aware that an automatic pass only becomes a full licence if you later sit the test again in a manual, so it is worth deciding early rather than late.",
  },
  {
    q: "What if you have a medical condition?",
    a: "Automatic is often recommended where a condition affects limb coordination or movement, because clutch control comes off the table entirely. Tell us what you are working with and we will talk it through honestly before you book anything.",
  },
];

export default async function AutoVsManual() {
  const banner = await getBanner("/auto-vs-manual", getCmsPage("/auto-vs-manual")!.banner);

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
              Book your first lesson
              <span aria-hidden>→</span>
            </Link>
            <Link href="/prices" className="btn btn-ghost">See prices</Link>
          </div>
        </div>
      </section>

      {/* ══ THE COMPARISON ══════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3.5rem" }}>
            <div style={{ maxWidth: "34ch" }}>
              <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>SIDE BY SIDE</p>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>two gearboxes, two licences</h2>
            </div>
            <p style={{ color: "#94a5c0", maxWidth: "42ch", fontSize: "1rem", lineHeight: 1.7 }}>
              We teach both, so we have no reason to push you either way. Here is the honest
              version of what each one gives you and what it costs you.
            </p>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {columns.map((c, i) => (
              <div key={c.key} className="card card-accent" style={{ padding: "2rem 1.75rem", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                  <span
                    style={{
                      width: "46px", height: "46px", borderRadius: "14px",
                      background: "rgba(47,122,224,0.14)",
                      border: "1px solid rgba(47,122,224,0.3)",
                      color: "#6aa6f5",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={c.icon} size={21} />
                  </span>
                  <span className="numeral" style={{ color: "#1e2e4a", fontSize: "2.4rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>{c.name}</h3>
                <p
                  style={{
                    display: "inline-block",
                    alignSelf: "flex-start",
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: "0.66rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#f47c20",
                    border: "1px solid rgba(244,124,32,0.3)",
                    borderRadius: "999px",
                    padding: "0.35rem 0.85rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {c.licence}
                </p>
                <p style={{ color: "#94a5c0", fontSize: "0.98rem", lineHeight: 1.65, marginBottom: "2rem" }}>
                  {c.tagline}
                </p>

                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#63779a", marginBottom: "1.1rem" }}>
                  What you gain
                </p>
                <div style={{ display: "grid", gap: "0.85rem", marginBottom: "2rem" }}>
                  {c.pros.map((p) => (
                    <div key={p} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <span style={{ color: "#f47c20", flexShrink: 0, marginTop: "1px" }}>
                        <Icon name="check-circle" size={17} />
                      </span>
                      <span style={{ color: "#eef2f9", fontSize: "0.93rem", lineHeight: 1.55 }}>{p}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid #24354f", paddingTop: "1.75rem" }}>
                  <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#63779a", marginBottom: "1.1rem" }}>
                    What to weigh up
                  </p>
                  <div style={{ display: "grid", gap: "0.85rem" }}>
                    {c.cons.map((p) => (
                      <div key={p} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <span style={{ color: "#63779a", flexShrink: 0, marginTop: "1px" }}>
                          <Icon name="caution" size={17} />
                        </span>
                        <span style={{ color: "#94a5c0", fontSize: "0.93rem", lineHeight: 1.55 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "2rem" }}>
                  <Link href="/enquiry" className="btn btn-ghost">
                    Book {c.name.toLowerCase()} lessons
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ OUR ADVICE — numbered rows on paper ═════════════════ */}
      <section style={{ background: "#f4f6fa", color: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a6b86", marginBottom: "1.25rem" }}>
            STRAIGHT ANSWERS
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", color: "#070d18", marginBottom: "3.5rem", maxWidth: "18ch" }}>
            what we tell people who ask
          </h2>

          <div>
            {advice.map((item, i) => (
              <div
                key={item.q}
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
                  <h3 style={{ fontSize: "clamp(1.35rem, 3vw, 1.9rem)", color: "#070d18" }}>{item.q}</h3>
                  <p style={{ color: "#46566f", fontSize: "0.98rem", lineHeight: 1.7 }}>{item.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(7,13,24,0.14)", paddingTop: "2.5rem" }}>
            <Link href="/enquiry" className="btn btn-dark">
              Talk it through with us
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ THE LICENCE, PLAINLY ════════════════════════════════ */}
      <section style={{ background: "#0d1728", padding: "clamp(4.5rem, 10vw, 7.5rem) 0", borderTop: "1px solid #1c2b45", borderBottom: "1px solid #1c2b45" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>THE BIT THAT MATTERS</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", marginBottom: "3.25rem", maxWidth: "22ch" }}>
            what your pass certificate actually lets you drive
          </h2>

          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            {[
              {
                icon: "shield",
                title: "Pass in a manual",
                desc: "You can drive anything in the category — manual or automatic — from the day you pass. Nothing else to sit, nothing else to pay for.",
              },
              {
                icon: "automatic",
                title: "Pass in an automatic",
                desc: "You are licensed for automatics only. Manuals stay off limits until you take a second practical test in one.",
              },
              {
                icon: "refresh",
                title: "Upgrading later",
                desc: "It is a full practical test again, plus the lessons to get you there. Doable, but it is the expensive route — better to choose well now.",
              },
            ].map((item, i) => (
              <div key={item.title} className="card card-accent" style={{ padding: "2rem 1.75rem" }}>
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
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>STILL ON THE FENCE</p>
          <h2 style={{ fontSize: "clamp(2.2rem, 6.5vw, 4.4rem)", marginBottom: "1.5rem", maxWidth: "16ch", marginInline: "auto" }}>
            tell us how you learn and we&apos;ll tell you which
          </h2>
          <p style={{ color: "#94a5c0", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "48ch", margin: "0 auto 2.5rem" }}>
            No obligation and no sales pitch. Send us a couple of lines about where you are up to
            and we&apos;ll give you a straight recommendation.
          </p>
          <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/enquiry" className="btn btn-accent">
              Book your first lesson
              <span aria-hidden>→</span>
            </Link>
            <Link href="/prices" className="btn btn-ghost">View prices</Link>
          </div>
        </div>
      </section>
    </>
  );
}
