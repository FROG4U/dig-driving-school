"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/lessons", label: "Lessons" },
  { href: "/prices", label: "Prices" },
  { href: "/auto-vs-manual", label: "Auto vs Manual" },
  { href: "/theory-test", label: "Theory" },
  { href: "/qa", label: "Q&A" },
  { href: "/useful-links", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ logoUrl }: { logoUrl?: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 200,
          backgroundColor: scrolled ? "rgba(7,13,24,0.82)" : "transparent",
          backdropFilter: scrolled ? "saturate(160%) blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "saturate(160%) blur(14px)" : "none",
          borderBottom: `1px solid ${scrolled ? "#1c2b45" : "transparent"}`,
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        <div className="max-w-[1240px] mx-auto px-5 flex items-center justify-between" style={{ height: "76px" }}>
          {/* ── Wordmark ── */}
          <Link href="/" className="bare" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.65rem" }} onClick={() => setMenuOpen(false)}>
            {logoUrl ? (
              /* The logo artwork is drawn FOR a dark background - its "Driving
                 School" wordmark is white - so it sits straight on the navy bar.
                 Do not put it on a white plate: the wordmark disappears. */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoUrl}
                alt="Dig Driving School"
                style={{ height: "46px", width: "auto", display: "block" }}
              />
            ) : (
              <>
                <span
                  style={{
                    width: "34px", height: "34px", borderRadius: "10px",
                    background: "#1b5cb8", color: "#ffffff",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700,
                    fontSize: "1.05rem", letterSpacing: "-0.05em", flexShrink: 0,
                    boxShadow: "inset 0 -3px 0 rgba(244,124,32,0.9)",
                  }}
                >
                  d
                </span>
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
                  <span style={{ color: "#eef2f9", fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: "1.15rem", letterSpacing: "-0.04em" }}>
                    dig
                  </span>
                  <span style={{ color: "#94a5c0", fontFamily: "var(--font-mono), monospace", fontSize: "0.53rem", letterSpacing: "0.19em", textTransform: "uppercase" }}>
                    Driving School
                  </span>
                </span>
              </>
            )}
          </Link>

          {/* ── Desktop nav: floating pill ── */}
          <nav
            className="hidden xl:flex items-center"
            style={{
              gap: "0.15rem",
              backgroundColor: "#0d1728",
              border: "1px solid #1c2b45",
              borderRadius: "999px",
              padding: "0.3rem",
            }}
          >
            {navLinks.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="bare"
                  style={{
                    color: active ? "#ffffff" : "#94a5c0",
                    backgroundColor: active ? "#1b5cb8" : "transparent",
                    fontWeight: active ? 600 : 500,
                    fontSize: "0.79rem",
                    textDecoration: "none",
                    padding: "0.5rem 0.85rem",
                    borderRadius: "999px",
                    whiteSpace: "nowrap",
                    transition: "color 0.18s ease, background-color 0.18s ease",
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop CTA ── */}
          <div className="hidden xl:flex items-center" style={{ gap: "0.75rem" }}>
            <Link href="/enquiry" className="btn btn-accent" style={{ fontSize: "0.82rem", padding: "0.7rem 1.4rem" }}>
              Book a lesson
              <span aria-hidden style={{ fontSize: "1rem", lineHeight: 1 }}>→</span>
            </Link>
          </div>

          {/* ── Mobile toggle ── */}
          {/* Wrapped so the responsive class controls display — an inline
              `display` on the button itself would override the utility. */}
          <div className="xl:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            style={{
              display: "flex", flexDirection: "column", gap: "5px",
              background: "#0d1728", border: "1px solid #1c2b45",
              borderRadius: "12px", padding: "0.7rem 0.75rem", cursor: "pointer",
            }}
          >
            <span style={{ display: "block", width: 20, height: 2, borderRadius: 2, background: menuOpen ? "#f47c20" : "#eef2f9", transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none", transition: "transform 0.25s ease, background-color 0.2s ease" }} />
            <span style={{ display: "block", width: 20, height: 2, borderRadius: 2, background: "#eef2f9", opacity: menuOpen ? 0 : 1, transition: "opacity 0.2s ease" }} />
            <span style={{ display: "block", width: 20, height: 2, borderRadius: 2, background: menuOpen ? "#f47c20" : "#eef2f9", transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none", transition: "transform 0.25s ease, background-color 0.2s ease" }} />
          </button>
          </div>
        </div>
      </header>

      {/* ── Full-screen mobile menu ── */}
      {menuOpen && (
        <div
          className="xl:hidden"
          style={{
            position: "fixed", inset: "76px 0 0 0", zIndex: 190,
            backgroundColor: "#070d18",
            overflowY: "auto",
            padding: "1.5rem 1.25rem 3rem",
          }}
        >
          <nav style={{ display: "flex", flexDirection: "column" }}>
            {navLinks.map((l, i) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="bare"
                  style={{
                    display: "flex", alignItems: "baseline", gap: "1rem",
                    padding: "1rem 0.25rem",
                    borderBottom: "1px solid #1c2b45",
                    textDecoration: "none",
                    color: active ? "#f47c20" : "#eef2f9",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    letterSpacing: "-0.035em",
                    textTransform: "lowercase",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "0.68rem", color: "#63779a", letterSpacing: "0.1em", fontWeight: 400 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/enquiry"
            onClick={() => setMenuOpen(false)}
            className="btn btn-accent"
            style={{ width: "100%", marginTop: "2rem", fontSize: "1rem", padding: "1.1rem" }}
          >
            Book a lesson
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </>
  );
}
