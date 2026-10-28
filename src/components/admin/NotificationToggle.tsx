"use client";

import { useEffect, useState } from "react";

// Converts a base64url VAPID key to the Uint8Array the Push API expects.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = "unsupported" | "loading" | "off" | "on" | "blocked" | "unavailable";

export default function NotificationToggle() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setState("unsupported");
        return;
      }
      // No push server configured → nothing to enable.
      try {
        const res = await fetch("/api/admin/push/public-key");
        const { publicKey } = await res.json();
        if (!publicKey) { setState("unavailable"); return; }
      } catch { setState("unavailable"); return; }

      if (Notification.permission === "denied") { setState("blocked"); return; }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setState(sub ? "on" : "off");
      } catch { setState("off"); }
    })();
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState(perm === "denied" ? "blocked" : "off"); setBusy(false); return; }

      const { publicKey } = await (await fetch("/api/admin/push/public-key")).json();
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      const res = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setState(res.ok ? "on" : "off");
    } catch {
      setState("off");
    }
    setBusy(false);
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/admin/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } catch { /* ignore */ }
    setBusy(false);
  }

  if (state === "loading" || state === "unsupported" || state === "unavailable") return null;

  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "0.35rem",
    fontSize: "0.78rem", fontWeight: 600, padding: "0.3rem 0.7rem",
    borderRadius: "4px", cursor: busy ? "default" : "pointer", border: "1px solid",
    whiteSpace: "nowrap",
  };

  if (state === "blocked") {
    return (
      <span title="Notifications are blocked in your browser settings for this site." style={{ ...base, cursor: "default", color: "#c0392b", backgroundColor: "#fce8e8", borderColor: "#f5c2c2" }}>
        🔕 Notifications blocked
      </span>
    );
  }
  if (state === "on") {
    return (
      <button onClick={disable} disabled={busy} style={{ ...base, color: "#1e7e34", backgroundColor: "#e6f4ea", borderColor: "#b8dfc0" }}>
        🔔 {busy ? "…" : "Notifications on"}
      </button>
    );
  }
  return (
    <button onClick={enable} disabled={busy} style={{ ...base, color: "#2271b1", backgroundColor: "#f0f6fc", borderColor: "#bdd7f0" }}>
      🔔 {busy ? "Enabling…" : "Enable notifications"}
    </button>
  );
}
