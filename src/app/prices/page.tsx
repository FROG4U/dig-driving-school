import type { Metadata } from "next";
import Link from "next/link";
import { getPageMetadata } from "@/lib/seo";
import { getBanner, bannerBg } from "@/lib/content";
import { getCmsPage } from "@/lib/cms-pages";
import { getContactSettings } from "@/lib/site-settings";
import { SITE } from "@/lib/site-config";
import Icon from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/prices", {
    title: `Driving Lesson Prices ${SITE.location} | Dig Driving School`,
    description: `Clear driving lesson prices in ${SITE.location}. Manual from £40/hr, automatic from £45/hr, first 2 manual lessons £55. Block bookings and intensive courses available.`,
  });
}

const manualStandard = [
  { label: "First 2 lessons", price: "£55", note: "introductory offer" },
  { label: "Standard lesson", price: "£40", note: "1 hour" },
  { label: "Block of 10 hours", price: "£390", note: "save £10" },
  { label: "Motorway & refreshers", price: "£80", note: "2 hours" },
];

const autoStandard = [
  { label: "First 2 lessons", price: "£65", note: "introductory offer" },
  { label: "Standard lesson", price: "£45", note: "1 hour" },
  { label: "Block of 10 hours", price: "£440", note: "save £10" },
];

const intensiveManual = [
  { hours: "40 hours", price: "£1,660", highlight: true },
  { hours: "30 hours", price: "£1,260", highlight: false },
  { hours: "20 hours", price: "£860", highlight: false },
];

const intensiveAuto = [
  { hours: "40 hours", price: "£1,860", highlight: true },
  { hours: "30 hours", price: "£1,410", highlight: false },
  { hours: "20 hours", price: "£960", highlight: false },
];

const notes = [
  "Cancelling or rescheduling: we ask for at least 48 hours' notice. Anything shorter is charged at the full lesson price.",
  "Lessons run 7 days a week, evenings and weekends included, at no extra charge.",
  "Block bookings stay valid for 3 months from the day you buy them.",
  "Pick-up from home, work, college or school is included in every price.",
  "We confirm your exact pick-up area with you before the first booking.",
  "Every price includes the use of our dual-control car, fully insured and maintained.",
  "Theory test revision support is included with every intensive course.",
];

/** Dark price list — rows separated by rules, price right-aligned in volt. */
function PriceList({
  rows,
  title,
  icon,
}: {
  rows: { label: string; price: string; note: string }[];
  title: string;
  icon: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.5rem" }}>
        <span
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "rgba(47,122,224,0.14)",
            border: "1px solid rgba(47,122,224,0.3)",
            color: "#6aa6f5",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={19} />
        </span>
        <h3 style={{ fontSize: "1.28rem" }}>{title}</h3>
      </div>

      <div className="card" style={{ padding: "0.5rem 1.5rem" }}>
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1.25rem",
              padding: "1.15rem 0",
              borderTop: i === 0 ? "none" : "1px solid #24354f",
            }}
          >
            <div>
              <div style={{ color: "#eef2f9", fontSize: "0.98rem", fontWeight: 500 }}>{row.label}</div>
              {row.note && (
                <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#63779a", marginTop: "0.35rem" }}>
                  {row.note}
                </div>
              )}
            </div>
            <span className="numeral" style={{ color: "#f47c20", fontSize: "1.5rem", whiteSpace: "nowrap" }}>
              {row.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Light intensive-course list, used on the paper section. */
function IntensiveList({
  rows,
  title,
  icon,
}: {
  rows: { hours: string; price: string; highlight: boolean }[];
  title: string;
  icon: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.25rem" }}>
        <span style={{ color: "#070d18", display: "inline-flex" }}>
          <Icon name={icon} size={20} />
        </span>
        <h3 style={{ fontSize: "1.28rem", color: "#070d18" }}>{title}</h3>
      </div>

      <div>
        {rows.map((c) => (
          <div
            key={c.hours}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1.25rem",
              borderTop: "1px solid rgba(7,13,24,0.14)",
              padding: "1.35rem 0",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, letterSpacing: "-0.03em", fontSize: "1.15rem", color: "#070d18" }}>
                {c.hours}
              </div>
              <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#5a6b86", marginTop: "0.35rem" }}>
                {c.highlight ? "incl. test fee · most popular" : "incl. practical test fee"}
              </div>
            </div>
            <span className="numeral" style={{ fontSize: "clamp(1.6rem, 4vw, 2.1rem)", color: "#070d18", whiteSpace: "nowrap" }}>
              {c.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Prices() {
  const [banner, contact] = await Promise.all([
    getBanner("/prices", getCmsPage("/prices")!.banner),
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
            <Link href="/lessons" className="btn btn-ghost">What we teach</Link>
          </div>
        </div>
      </section>

      {/* ══ STANDARD LESSONS ════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3.5rem" }}>
            <div style={{ maxWidth: "34ch" }}>
              <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>PAY AS YOU GO</p>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}>standard lessons</h2>
            </div>
            <p style={{ color: "#94a5c0", maxWidth: "42ch", fontSize: "1rem", lineHeight: 1.7 }}>
              Pay lesson by lesson, or put a block down and save. Every price already includes us
              collecting you from wherever you are in {SITE.location}.
            </p>
          </div>

          <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            <PriceList title="manual lessons" icon="wrench" rows={manualStandard} />
            <PriceList title="automatic lessons" icon="automatic" rows={autoStandard} />
          </div>
        </div>
      </section>

      {/* ══ INTENSIVE COURSES — on paper ════════════════════════ */}
      <section style={{ background: "#f4f6fa", color: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a6b86", marginBottom: "1.25rem" }}>
            FAST TRACK
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", color: "#070d18", marginBottom: "1.5rem", maxWidth: "18ch" }}>
            intensive courses
          </h2>
          <p style={{ color: "#46566f", fontSize: "1rem", lineHeight: 1.7, maxWidth: "56ch", marginBottom: "3.25rem" }}>
            For learners who would rather do it in one concentrated push. Every course price includes
            the practical driving test fee.
          </p>

          <div className="grid gap-10" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            <IntensiveList title="manual intensive" icon="car" rows={intensiveManual} />
            <IntensiveList title="automatic intensive" icon="automatic" rows={intensiveAuto} />
          </div>

          <div style={{ borderTop: "1px solid rgba(7,13,24,0.14)", marginTop: "3rem", paddingTop: "2.5rem" }}>
            <Link href="/enquiry" className="btn btn-dark">
              Check intensive availability
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ THE SMALL PRINT ═════════════════════════════════════ */}
      <section style={{ background: "#0d1728", padding: "clamp(4.5rem, 10vw, 7.5rem) 0", borderTop: "1px solid #1c2b45", borderBottom: "1px solid #1c2b45" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>THE SMALL PRINT</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", marginBottom: "3rem", maxWidth: "20ch" }}>
            what&apos;s included and what to know
          </h2>

          <div style={{ maxWidth: "900px" }}>
            {notes.map((note, i) => (
              <div
                key={note}
                className="grid gap-6 items-start"
                style={{
                  gridTemplateColumns: "minmax(0, auto) minmax(0, 1fr)",
                  borderTop: "1px solid #24354f",
                  padding: "1.4rem 0",
                }}
              >
                <span className="numeral" style={{ fontSize: "1.9rem", color: "#1e2e4a", minWidth: "2.2ch" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p style={{ color: "#94a5c0", fontSize: "0.97rem", lineHeight: 1.7 }}>{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CLOSING CTA ═════════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>READY TO BOOK</p>
          <h2 style={{ fontSize: "clamp(2.2rem, 6.5vw, 4.4rem)", marginBottom: "1.5rem", maxWidth: "16ch", marginInline: "auto" }}>
            secure your lessons
          </h2>
          <p style={{ color: "#94a5c0", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "48ch", margin: "0 auto 2.5rem" }}>
            Tell us which option you like the look of and we&apos;ll confirm availability, pick-up and
            the plan for your first few hours.
          </p>
          <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/enquiry" className="btn btn-accent">
              Book online
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
