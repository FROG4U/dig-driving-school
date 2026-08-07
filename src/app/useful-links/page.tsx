import type { Metadata } from "next";
import Link from "next/link";
import { getPageMetadata } from "@/lib/seo";
import { getBanner, bannerBg } from "@/lib/content";
import { getCmsPage } from "@/lib/cms-pages";
import { SITE } from "@/lib/site-config";
import Icon from "@/components/Icon";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/useful-links", {
    title: `Useful Links for Learner Drivers | ${SITE.name}`,
    description: `Every official link a learner driver needs in one place — apply for a provisional licence, book your theory and practical tests, find your test centre and read the Highway Code. Curated for our pupils in ${SITE.location}.`,
  });
}

type ResourceLink = {
  icon: string;
  title: string;
  desc: string;
  url: string;
  label: string;
};

type LinkGroup = {
  eyebrow: string;
  heading: string;
  intro: string;
  links: ResourceLink[];
};

const groups: LinkGroup[] = [
  {
    eyebrow: "STEP ONE",
    heading: "get yourself licensed",
    intro:
      "Before a single lesson happens you need a provisional in your hand. Apply online, and give it a couple of weeks to arrive.",
    links: [
      {
        icon: "clipboard",
        title: "Apply for your provisional licence",
        desc: "The very first step. Apply through the DVLA — have your National Insurance number and a passport-style photo ready.",
        url: "https://www.gov.uk/apply-first-provisional-driving-licence",
        label: "Apply on GOV.UK",
      },
      {
        icon: "chart",
        title: "Driving test costs",
        desc: "The current official fees for both the theory and the practical, so you can budget the whole thing properly from day one.",
        url: "https://www.gov.uk/driving-test-cost",
        label: "View test costs",
      },
    ],
  },
  {
    eyebrow: "BOOKING",
    heading: "book your tests",
    intro:
      "Always book direct with the DVSA. Third-party booking sites charge you a fee for typing the same details into the same form.",
    links: [
      {
        icon: "book",
        title: "Book your theory test",
        desc: "Theory comes first — you cannot sit the practical without it. Book through the official DVSA service.",
        url: "https://www.gov.uk/book-theory-test",
        label: "Book theory test",
      },
      {
        icon: "car",
        title: "Book your practical test",
        desc: "Once the theory is in the bag, book your practical at whichever centre suits you.",
        url: "https://www.gov.uk/book-driving-test",
        label: "Book practical test",
      },
      {
        icon: "pin",
        title: "Find a practical test centre",
        desc: "Search practical test centres by postcode or town so you know your options before you commit to a date.",
        url: "https://www.gov.uk/find-driving-test-centre",
        label: "Find test centre",
      },
      {
        icon: "target",
        title: "Find a theory test centre",
        desc: "Locate your nearest theory centre and see what appointment slots are actually available.",
        url: "https://www.gov.uk/find-theory-test-centre",
        label: "Find theory centre",
      },
    ],
  },
  {
    eyebrow: "REVISION",
    heading: "learn the rules",
    intro:
      "Read these early. Everything in your lessons makes more sense once the rules underneath it are familiar.",
    links: [
      {
        icon: "shield",
        title: "The Highway Code",
        desc: "The official rules of the road, updated regularly. Essential before your theory and worth revisiting before your practical.",
        url: "https://www.gov.uk/guidance/the-highway-code",
        label: "Read Highway Code",
      },
      {
        icon: "bolt",
        title: "Know your traffic signs",
        desc: "The DVSA guide to every UK traffic sign, free as a PDF. One of the best returns on an hour of revision you will find.",
        url: "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/519129/know-your-traffic-signs.pdf",
        label: "Download PDF",
      },
      {
        icon: "school",
        title: "Young and first driver guide",
        desc: "A plain-English guide for new drivers covering running costs, insurance and staying safe in that first year on your own.",
        url: "https://www.hendy.co.uk/resources/young-drivers-guide/",
        label: "Read the guide",
      },
    ],
  },
];

function LinkCard({ link, index }: { link: ResourceLink; index: number }) {
  return (
    <div className="card card-accent" style={{ padding: "2rem 1.75rem", display: "flex", flexDirection: "column" }}>
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
          <Icon name={link.icon} size={21} />
        </span>
        <span className="numeral" style={{ color: "#1e2e4a", fontSize: "2.4rem" }}>
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <h3 style={{ fontSize: "1.28rem", marginBottom: "0.7rem" }}>{link.title}</h3>
      <p style={{ color: "#94a5c0", fontSize: "0.92rem", lineHeight: 1.65, marginBottom: "1.75rem", flex: 1 }}>
        {link.desc}
      </p>

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-ghost bare"
        style={{ alignSelf: "flex-start" }}
      >
        {link.label}
        <span aria-hidden>↗</span>
      </a>
    </div>
  );
}

export default async function UsefulLinks() {
  const banner = await getBanner("/useful-links", getCmsPage("/useful-links")!.banner);

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
          <p
            style={{
              display: "inline-block",
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.66rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#f47c20",
              border: "1px solid rgba(244,124,32,0.3)",
              borderRadius: "999px",
              padding: "0.45rem 1rem",
              marginTop: "2.5rem",
            }}
          >
            Official sources only — every link opens in a new tab
          </p>
        </div>
      </section>

      {/* ══ GROUP 01 — void ═════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>{groups[0].eyebrow}</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", marginBottom: "1.25rem", maxWidth: "20ch" }}>
            {groups[0].heading}
          </h2>
          <p style={{ color: "#94a5c0", maxWidth: "56ch", fontSize: "1rem", lineHeight: 1.7, marginBottom: "3rem" }}>
            {groups[0].intro}
          </p>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            {groups[0].links.map((l, i) => (
              <LinkCard key={l.url} link={l} index={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ GROUP 02 — ink ══════════════════════════════════════ */}
      <section style={{ background: "#0d1728", padding: "clamp(4.5rem, 10vw, 7.5rem) 0", borderTop: "1px solid #1c2b45", borderBottom: "1px solid #1c2b45" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>{groups[1].eyebrow}</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", marginBottom: "1.25rem", maxWidth: "20ch" }}>
            {groups[1].heading}
          </h2>
          <p style={{ color: "#94a5c0", maxWidth: "56ch", fontSize: "1rem", lineHeight: 1.7, marginBottom: "3rem" }}>
            {groups[1].intro}
          </p>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            {groups[1].links.map((l, i) => (
              <LinkCard key={l.url} link={l} index={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ GROUP 03 — void ═════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>{groups[2].eyebrow}</p>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", marginBottom: "1.25rem", maxWidth: "20ch" }}>
            {groups[2].heading}
          </h2>
          <p style={{ color: "#94a5c0", maxWidth: "56ch", fontSize: "1rem", lineHeight: 1.7, marginBottom: "3rem" }}>
            {groups[2].intro}
          </p>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
            {groups[2].links.map((l, i) => (
              <LinkCard key={l.url} link={l} index={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ TOP TIP — paper ═════════════════════════════════════ */}
      <section style={{ background: "#f4f6fa", color: "#070d18", padding: "clamp(4.5rem, 10vw, 7.5rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5">
          <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a6b86", marginBottom: "1.25rem" }}>
            OUR TOP TIP
          </p>
          <div
            className="grid gap-6 items-start"
            style={{ gridTemplateColumns: "minmax(0, auto) minmax(0, 1fr)", borderTop: "1px solid rgba(7,13,24,0.14)", paddingTop: "2.5rem" }}
          >
            <span className="numeral" style={{ fontSize: "clamp(2.6rem, 7vw, 4.5rem)", color: "rgba(7,13,24,0.16)", minWidth: "2.2ch" }}>
              01
            </span>
            <div>
              <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", color: "#070d18", marginBottom: "1rem", maxWidth: "24ch" }}>
                do the paperwork before the driving
              </h2>
              <p style={{ color: "#46566f", fontSize: "1rem", lineHeight: 1.75, maxWidth: "62ch" }}>
                Get your provisional applied for and start on the Highway Code weeks before your first
                lesson. Pupils who arrive already knowing their signs and rules progress noticeably
                faster behind the wheel — and they spend less overall, because none of the lesson time
                goes on things a free PDF could have taught them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CLOSING CTA ═════════════════════════════════════════ */}
      <section style={{ background: "#070d18", padding: "clamp(4.5rem, 10vw, 7rem) 0" }}>
        <div className="max-w-[1240px] mx-auto px-5" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>READY WHEN YOU ARE</p>
          <h2 style={{ fontSize: "clamp(2.2rem, 6.5vw, 4.4rem)", marginBottom: "1.5rem", maxWidth: "16ch", marginInline: "auto" }}>
            provisional sorted? let&apos;s get you driving
          </h2>
          <p style={{ color: "#94a5c0", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "48ch", margin: "0 auto 2.5rem" }}>
            Once the licence is in your hand there is nothing left to arrange. Tell us when suits and
            we&apos;ll pick you up from the door.
          </p>
          <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/enquiry" className="btn btn-accent">
              Book your first lesson
              <span aria-hidden>→</span>
            </Link>
            <Link href="/theory-test" className="btn btn-ghost">Theory test help</Link>
          </div>
        </div>
      </section>
    </>
  );
}
