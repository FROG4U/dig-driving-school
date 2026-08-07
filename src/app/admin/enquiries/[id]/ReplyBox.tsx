"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReplyBox({ id, to }: { id: string; to: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function send() {
    if (!message.trim()) return;
    setState("sending");
    setError("");
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Could not send the reply.");
      }
      setState("sent");
      setMessage("");
      router.refresh();
      setTimeout(() => setState("idle"), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the reply.");
      setState("error");
    }
  }

  return (
    <div style={{ borderTop: "1px solid #f0f0f1", marginTop: "1.5rem", paddingTop: "1.25rem" }}>
      <div style={{ fontSize: "0.78rem", color: "#50575e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>
        Reply to {to}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your reply here — it will be emailed to the customer, and replies come back to your inbox."
        style={{ width: "100%", minHeight: "120px", padding: "0.75rem", border: "1px solid #c3c4c7", borderRadius: "6px", fontSize: "0.9rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", color: "#1d2327" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginTop: "0.6rem" }}>
        <button
          onClick={send}
          disabled={state === "sending" || !message.trim()}
          style={{ backgroundColor: state === "sent" ? "#1e7e34" : "#2271b1", color: "#fff", border: "none", borderRadius: "6px", padding: "0.55rem 1.4rem", fontWeight: 600, fontSize: "0.88rem", cursor: state === "sending" || !message.trim() ? "default" : "pointer", opacity: state === "sending" || !message.trim() ? 0.7 : 1 }}
        >
          {state === "sending" ? "Sending…" : state === "sent" ? "✓ Reply sent" : "Send Reply"}
        </button>
        {state === "error" && <span style={{ color: "#d63638", fontSize: "0.82rem" }}>{error}</span>}
      </div>
    </div>
  );
}
