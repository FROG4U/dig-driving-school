"use client";

import { useEffect, useState } from "react";

/**
 * Floating "chat on WhatsApp" button, bottom-right of every public page.
 *
 * Kept in WhatsApp's own green rather than the site orange: people recognise
 * the colour and glyph instantly, and the orange is already carrying the
 * "Book a lesson" call to action. It sits above the page but out of the way,
 * and the label collapses to just the icon on narrow screens.
 */
export default function WhatsAppButton({ href }: { href: string }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const check = () => setCompact(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat to us on WhatsApp"
      style={{
        position: "fixed",
        right: "clamp(1rem, 3vw, 1.75rem)",
        bottom: "clamp(1rem, 3vw, 1.75rem)",
        zIndex: 60,
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 0 : "0.6rem",
        padding: compact ? "0.85rem" : "0.8rem 1.15rem",
        borderRadius: "999px",
        background: "#25d366",
        color: "#06210f",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 700,
        fontSize: "0.95rem",
        textDecoration: "none",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.12) inset",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.98-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.84-.85 2.04 0 1.2.87 2.36.99 2.52.12.17 1.71 2.61 4.15 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29Z" />
      </svg>
      {!compact && <span>Chat on WhatsApp</span>}
    </a>
  );
}
