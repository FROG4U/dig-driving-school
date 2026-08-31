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
    title: `Driving Lesson Prices ${SITE.location} | DIG Driving School`,
    description: `Clear driving lesson prices in ${SITE.location}. Manual lessons £35/hr, automatic £40/hr. 10-hour block bookings available. Door-to-door pick-up, seven days a week.`,
  });
}

const manualStandard = [
  { label: "Single lesson", price: "£35", note: "per hour" },
  { label: "10-hour block", price: "£360", note: "block booking" },
];

const autoStandard = [
  { label: "Single lesson", price: "£40", note: "per hour" },
  { label: "10-hour block", price: "£400", note: "block booking" },
];

const notes = [
  "Cancelling or rescheduling: we ask for at least 48 hours' notice. Anything shorter is charged at the full lesson price.",
  "Lessons run 7 days a week, evenings and weekends included, at no extra charge.",
  "Block bookings stay valid for 3 months from the day you buy them.",
  "Pick-up from home, work, college or school is included in every price.",
  "We confirm your exact pick-up area with you before the first booking.",
  "Every price includes the use of our dual-control car, fully insured and maintained.",
];

/** Dark price list - rows separated by rules, price right-aligned in volt. */
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
              Pay lesson by lesson, or book a 10-hour block. Every price already includes us
              collecting you from wherever you are in {SITE.location}.
            </p>
          </div>

          <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            <PriceList title="manual lessons" icon="wrench" rows={manualStandard} />
            <PriceList title="automatic lessons" icon="automatic" rows={autoStandard} />
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
