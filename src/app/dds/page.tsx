"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Full-page navigation (not client-side router.push) so the server
      // re-renders /admin/dashboard with the freshly set auth cookie.
      window.location.href = "/admin/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
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
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1d2327", margin: 0 }}>Dig Driving School</h1>
          <p style={{ color: "#50575e", fontSize: "0.82rem", margin: "0.3rem 0 0" }}>Admin Panel</p>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: "4px", padding: "1.75rem", border: "1px solid #c3c4c7", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "1.25rem", color: "#1d2327", margin: "0 0 1.25rem" }}>Sign In</h2>

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
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#8c8f94", marginTop: "1.25rem" }}>
          This area is not accessible to the public.
        </p>
      </div>
    </div>
  );
}
