import type { CSSProperties } from "react";

// ── Keyline (outline) icon set ───────────────────────────────────────
// Stroke-based 24×24 SVGs that inherit `currentColor`. Used site-wide in
// place of emoji for a consistent modern look. Editable service cards pick
// an icon by name (see `iconNames`).
const paths: Record<string, React.ReactNode> = {
  car: (
    <>
      <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
      <path d="M3 11h18v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <circle cx="7" cy="14" r="0.5" /><circle cx="17" cy="14" r="0.5" />
    </>
  ),
  automatic: (
    <>
      <path d="M3.5 9a8 8 0 0 1 13.4-3.3L21 9" />
      <path d="M20.5 15a8 8 0 0 1-13.4 3.3L3 15" />
      <path d="M21 4v5h-5M3 20v-5h5" />
    </>
  ),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  refresh: (
    <>
      <path d="M3 11a8 8 0 0 1 14-5l3 3M21 13a8 8 0 0 1-14 5l-3-3" />
      <path d="M20 3v5h-5M4 21v-5h5" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4a3 3 0 0 1 6 0" />
      <path d="M9 11h6M9 15h6" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" />
      <path d="M12 14v3M9 21h6M10 21v-2a2 2 0 0 1 4 0v2" />
    </>
  ),
  phone: (
    <path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 9h16M8 3v4M16 3v4" />
    </>
  ),
  star: (
    <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8 6.8 19l1-5.8L3.6 9.1l5.8-.8z" />
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />
    </>
  ),
  book: (
    <>
      <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" />
      <path d="M5 18a2 2 0 0 1 2-2h11" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M8 14l3-4 3 2 4-6" />
    </>
  ),
  instructor: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  school: (
    <>
      <path d="M12 4l9 4-9 4-9-4z" />
      <path d="M7 10v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5" />
    </>
  ),
  wrench: (
    <path d="M15 7a4 4 0 0 0-5 5l-6 6 2 2 6-6a4 4 0 0 0 5-5l-2.5 2.5L15 12l-1.5-2.5z" />
  ),
  sparkle: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  steering: (
    <>
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.5" />
      <path d="M4 11h6M14 11h6M11 14l-3 6M13 14l3 6" />
    </>
  ),
  home: (
    <>
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7" r="3.5" />
      <path d="M3 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M21 20a4.5 4.5 0 0 0-7.5-2" />
    </>
  ),
  caution: (
    <>
      <path d="M10.4 4a2 2 0 0 1 3.2 0l8 13.5A2 2 0 0 1 19.8 21H4.2a2 2 0 0 1-1.7-3.5z" />
      <path d="M12 9v4.5" />
      <circle cx="12" cy="16.5" r=".5" fill="currentColor" />
    </>
  ),
  facebook: (
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  ),
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  "twitter-x": (
    <path d="M4 4l4.7 5.9L4 19h2.2l3.6-4.3 3.2 4.3H17L12 12.8 17.5 4h-2.2L12 8.2 8.5 4z" />
  ),
  tiktok: (
    <path d="M9 12a4 4 0 1 0 4 4V4h3a5 5 0 0 0 5 5" />
  ),
  youtube: (
    <>
      <path d="M22.5 6.5a2.5 2.5 0 0 0-2-1.8C18.7 4.3 12 4.3 12 4.3s-6.7 0-8.5.4a2.5 2.5 0 0 0-2 1.8C1 8.2 1 12 1 12s0 3.8.5 5.5a2.5 2.5 0 0 0 2 1.8c1.8.4 8.5.4 8.5.4s6.7 0 8.5-.4a2.5 2.5 0 0 0 2-1.8C23 15.8 23 12 23 12s0-3.8-.5-5.5z" />
      <path d="M10 9.5l4.5 2.5-4.5 2.5z" fill="currentColor" stroke="none" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
};

export const iconNames = Object.keys(paths);

export default function Icon({
  name,
  size = 24,
  strokeWidth = 1.75,
  color = "currentColor",
  gradient,
  style,
  className,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  /** Two-tone gradient [from, to] applied to the stroke. Overrides `color`. */
  gradient?: [string, string];
  style?: CSSProperties;
  className?: string;
}) {
  const content = paths[name] ?? paths.car;
  const gradId = gradient ? `icongrad-${name}` : undefined;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={gradient ? `url(#${gradId})` : color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
      )}
      {content}
    </svg>
  );
}
