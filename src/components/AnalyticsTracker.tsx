"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSession(): string {
  const key = "dds_sid";
  let sid = localStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, sid);
  }
  return sid;
}

function getDevice(): string {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip admin routes
    if (pathname.startsWith("/admin")) return;

    try {
      const sessionId = getOrCreateSession();
      const referrer = document.referrer || null;
      const device = getDevice();

      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: pathname, referrer, sessionId, device }),
      }).catch(() => {});
    } catch { /* silent fail */ }
  }, [pathname]);

  return null;
}
