"use client";

import { useState } from "react";

type Stage = "password" | "code" | "forgot";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<Stage>("password");
  const [sentTo, setSentTo] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: email + password. A correct password does not sign you in on its
  // own - it sends a one-time code to that mailbox.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      if (data.step === "code") {
        setSentTo(data.email || form.email);
        setStage("code");
        setLoading(false);
        return;
      }

      // Full-page navigation (not client-side router.push) so the server
      // re-renders /admin/dashboard with the freshly set auth cookie.
      window.location.href = "/admin/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  // Step 2: the six-digit code from the email.
  async function handleCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "That code is not right.");
        setLoading(false);
        return;
      }
      window.location.href = "/admin/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json().catch(() => ({}));
      setNotice(data.message || "If that email has an admin account, a reset link is on its way.");
    } catch {
      setNotice("If that email has an admin account, a reset link is on its way.");
    }
    setLoading(false);
  }

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
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f0f1", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", backgroundColor: "#1d2327", borderRadius: "8px", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.6rem" }}>🚗</span>
          </div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1d2327", margin: 0 }}>DIG Driving School</h1>
          <p style={{ color: "#50575e", fontSize: "0.82rem", margin: "0.3rem 0 0" }}>Admin Panel</p>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: "4px", padding: "1.75rem", border: "1px solid #c3c4c7", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "1.25rem", color: "#1d2327", margin: "0 0 1.25rem" }}>
            {stage === "code" ? "Enter your code" : stage === "forgot" ? "Reset your password" : "Sign In"}
          </h2>

          {/* ── Step 2: the emailed code ───────────────────────────── */}
          {stage === "code" && (
            <form onSubmit={handleCode} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontSize: "0.85rem", color: "#50575e", margin: 0 }}>
                We have emailed a six-digit code to <strong>{sentTo}</strong>. It expires in 10 minutes.
              </p>
              <input
                style={{ ...inputStyle, fontSize: "1.4rem", letterSpacing: "0.4em", textAlign: "center", fontWeight: 700 }}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                autoFocus
                required
              />
              {error && (
                <div style={{ backgroundColor: "#fce8e8", border: "1px solid #f5c2c2", borderRadius: "4px", padding: "0.6rem 0.85rem", fontSize: "0.85rem", color: "#c0392b" }}>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading || code.length < 6}
                style={{ backgroundColor: "#2271b1", color: "#fff", padding: "0.7rem", borderRadius: "4px", border: "none", fontWeight: 600, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading || code.length < 6 ? 0.75 : 1 }}
              >
                {loading ? "Checking…" : "Verify and sign in"}
              </button>
              <button
                type="button"
                onClick={() => { setStage("password"); setCode(""); setError(""); }}
                style={{ background: "none", border: "none", color: "#2271b1", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
              >
                Start again
              </button>
            </form>
          )}

          {/* ── Forgot password ────────────────────────────────────── */}
          {stage === "forgot" && (
            <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontSize: "0.85rem", color: "#50575e", margin: 0 }}>
                Enter your admin email and we will send you a link to choose a new password.
              </p>
              <input
                style={inputStyle}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="you@example.com"
                autoFocus
              />
              {notice && (
                <div style={{ backgroundColor: "#e6f4ea", border: "1px solid #b8dfc0", borderRadius: "4px", padding: "0.6rem 0.85rem", fontSize: "0.85rem", color: "#1e7e34" }}>
                  {notice}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#2271b1", color: "#fff", padding: "0.7rem", borderRadius: "4px", border: "none", fontWeight: 600, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1 }}
              >
                {loading ? "Sending…" : "Email me a reset link"}
              </button>
              <button
                type="button"
                onClick={() => { setStage("password"); setNotice(""); setError(""); }}
                style={{ background: "none", border: "none", color: "#2271b1", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
              >
                Back to sign in
              </button>
            </form>
          )}

          {stage === "password" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1d2327", display: "block", marginBottom: "0.3rem" }}>
                Email Address
              </label>
              <input
                style={inputStyle}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="admin@digds.co.uk"
                autoComplete="username"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1d2327", display: "block", marginBottom: "0.3rem" }}>
                Password
              </label>
              <input
                style={inputStyle}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{ backgroundColor: "#fce8e8", border: "1px solid #f5c2c2", borderRadius: "4px", padding: "0.6rem 0.85rem", fontSize: "0.85rem", color: "#c0392b" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#2271b1", color: "#fff", padding: "0.7rem", borderRadius: "4px", border: "none", fontWeight: 600, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1, marginTop: "0.25rem" }}
            >
              {loading ? "Signing in…" : "Log In"}
            </button>

            <button
              type="button"
              onClick={() => { setStage("forgot"); setError(""); setNotice(""); }}
              style={{ background: "none", border: "none", color: "#2271b1", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
            >
              Forgot your password?
            </button>
          </form>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#8c8f94", marginTop: "1.25rem" }}>
          This area is not accessible to the public.
        </p>
      </div>
    </div>
  );
}
