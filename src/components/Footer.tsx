import Link from "next/link";
import Icon from "./Icon";
import { getContactSettings, getSocialSettings, type SocialSettings } from "@/lib/site-settings";

const socialConfig: { key: keyof SocialSettings; icon: string; label: string }[] = [
  { key: "facebook", icon: "facebook", label: "Facebook" },
  { key: "instagram", icon: "instagram", label: "Instagram" },
  { key: "twitter", icon: "twitter-x", label: "Twitter / X" },
  { key: "tiktok", icon: "tiktok", label: "TikTok" },
  { key: "youtube", icon: "youtube", label: "YouTube" },
];

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Learn",
    links: [
      { href: "/lessons", label: "Driving lessons" },
      { href: "/prices", label: "Prices & packages" },
      { href: "/auto-vs-manual", label: "Auto vs manual" },
      { href: "/theory-test", label: "Theory test" },
    ],
  },
  {
    title: "School",
    links: [
      { href: "/about", label: "About us" },
      { href: "/qa", label: "Questions" },
      { href: "/useful-links", label: "Useful links" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default async function Footer() {
  const [contact, social] = await Promise.all([getContactSettings(), getSocialSettings()]);
  const activeSocials = socialConfig.filter((s) => !!social[s.key]);

  return (
    <footer style={{ backgroundColor: "#070d18", color: "#94a5c0", marginTop: "auto", borderTop: "1px solid #1c2b45" }}>

      {/* ── Closing CTA band ── */}
      <div className="max-w-[1240px] mx-auto px-5" style={{ paddingTop: "4rem" }}>
        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, #f47c20 0%, #e06a15 100%)",
            border: "none",
            borderRadius: "28px",
            padding: "clamp(2rem, 5vw, 3.25rem)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.75rem",
          }}
        >
          <div style={{ minWidth: "260px", flex: "1 1 340px" }}>
            <h2 style={{ color: "#070d18", fontSize: "clamp(1.75rem, 4vw, 2.6rem)", marginBottom: "0.6rem" }}>
              your first lesson is waiting.
            </h2>
            <p style={{ color: "rgba(7,13,24,0.72)", fontSize: "0.98rem", lineHeight: 1.6, maxWidth: "440px" }}>
              Door-to-door pick-up, 7 days a week. Tell us when suits and we&apos;ll do the rest.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <Link href="/enquiry" className="btn btn-dark">
              Book a lesson
              <span aria-hidden>→</span>
            </Link>
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="btn bare" style={{ border: "1px solid rgba(7,13,24,0.28)", color: "#070d18" }}>
                {contact.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Link columns ── */}
      <div
        className="max-w-[1240px] mx-auto px-5 grid gap-10"
        style={{ paddingTop: "4rem", paddingBottom: "3rem", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
      >
        {columns.map((col) => (
          <div key={col.title}>
            <h4 style={{ color: "#63779a", fontFamily: "var(--font-mono), monospace", fontWeight: 500, marginBottom: "1.1rem", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {col.title}
            </h4>
            {col.links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="bare"
                style={{ display: "block", color: "#94a5c0", textDecoration: "none", fontSize: "0.88rem", marginBottom: "0.65rem", lineHeight: 1.4 }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        ))}

        {/* Contact details */}
        <div>
          <h4 style={{ color: "#63779a", fontFamily: "var(--font-mono), monospace", fontWeight: 500, marginBottom: "1.1rem", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Contact
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {contact.address && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.88rem" }}>
                <span style={{ marginTop: "1px", color: "#f47c20", flexShrink: 0 }}><Icon name="pin" size={16} /></span>
                <span>{contact.address}</span>
              </div>
            )}
            {contact.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.88rem" }}>
                <span style={{ color: "#f47c20", flexShrink: 0 }}><Icon name="phone" size={16} /></span>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="bare" style={{ color: "#eef2f9", textDecoration: "none", fontWeight: 500 }}>
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.email && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.88rem" }}>
                <span style={{ color: "#f47c20", flexShrink: 0 }}><Icon name="mail" size={16} /></span>
                <a href={`mailto:${contact.email}`} className="bare" style={{ color: "#eef2f9", textDecoration: "none", overflowWrap: "anywhere", minWidth: 0 }}>
                  {contact.email}
                </a>
              </div>
            )}
            {contact.hours && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.88rem" }}>
                <span style={{ color: "#f47c20", flexShrink: 0 }}><Icon name="clock" size={16} /></span>
                <span>{contact.hours}</span>
              </div>
            )}
          </div>
        </div>

        {/* Socials */}
        <div>
          <h4 style={{ color: "#63779a", fontFamily: "var(--font-mono), monospace", fontWeight: 500, marginBottom: "1.1rem", fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Follow
          </h4>
          {activeSocials.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
              {activeSocials.map(({ key, icon, label }) => (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="bare"
                  style={{
                    width: "42px", height: "42px", borderRadius: "999px",
                    backgroundColor: "#0d1728",
                    border: "1px solid #1c2b45",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    color: "#94a5c0", textDecoration: "none",
                  }}
                >
                  <Icon name={icon} size={17} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "0.82rem", color: "#63779a" }}>Social links coming soon.</p>
          )}
        </div>
      </div>

      {/* ── Oversized wordmark ── */}
      <div className="max-w-[1240px] mx-auto px-5" style={{ overflow: "hidden" }}>
        <div
          aria-hidden
          className="numeral"
          style={{
            color: "#101c30",
            fontSize: "clamp(4rem, 19vw, 15rem)",
            lineHeight: 0.85,
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          dig driving
        </div>
      </div>

      {/* ── Legal strip ── */}
      <div
        className="max-w-[1240px] mx-auto px-5"
        style={{
          borderTop: "1px solid #1c2b45",
          marginTop: "1.5rem",
          padding: "1.4rem 1.25rem 2rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "space-between",
          fontSize: "0.75rem",
          color: "#63779a",
          fontFamily: "var(--font-mono), monospace",
        }}
      >
        <span>© {new Date().getFullYear()} Dig Driving School</span>
        <span>DVSA approved instruction</span>
      </div>
    </footer>
  );
}
