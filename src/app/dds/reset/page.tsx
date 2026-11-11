"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetForm() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.65rem 0.9rem",
    backgroundColor: "#fff",
    border: "1px solid #c3c4c7",
    borderRadius: "4px",
    color: "#1d2327",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not reset your password.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f0f1", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1d2327", margin: 0 }}>DIG Driving School</h1>
          <p style={{ color: "#50575e", fontSize: "0.82rem", margin: "0.3rem 0 0" }}>Choose a new password</p>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: "4px", padding: "1.75rem", border: "1px solid #c3c4c7", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          {done ? (
            <>
              <div style={{ backgroundColor: "#e6f4ea", border: "1px solid #b8dfc0", borderRadius: "4px", padding: "0.75rem 1rem", fontSize: "0.9rem", color: "#1e7e34", marginBottom: "1rem" }}>
                Password changed. You can sign in with it now.
              </div>
              <a href="/dds" style={{ display: "block", textAlign: "center", backgroundColor: "#2271b1", color: "#fff", padding: "0.7rem", borderRadius: "4px", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
                Go to sign in
              </a>
            </>
          ) : !token ? (
            <p style={{ fontSize: "0.9rem", color: "#c0392b", margin: 0 }}>
              This link is missing its code. Request a new reset email from the sign-in page.
            </p>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1d2327", display: "block", marginBottom: "0.3rem" }}>New password</label>
                <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" autoFocus />
                <div style={{ fontSize: "0.72rem", color: "#8c8f94", marginTop: "0.3rem" }}>
                  At least 10 characters, with a letter and a number.
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1d2327", display: "block", marginBottom: "0.3rem" }}>Confirm new password</label>
                <input style={inputStyle} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
              </div>
              {error && (
                <div style={{ backgroundColor: "#fce8e8", border: "1px solid #f5c2c2", borderRadius: "4px", padding: "0.6rem 0.85rem", fontSize: "0.85rem", color: "#c0392b" }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#2271b1", color: "#fff", padding: "0.7rem", borderRadius: "4px", border: "none", fontWeight: 600, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1 }}
              >
                {loading ? "Saving…" : "Save new password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
