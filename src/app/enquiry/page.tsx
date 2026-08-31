"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

export default function EnquiryPage() {
  const [form, setForm] = useState({ fullName: "", contactNumber: "", email: "", location: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="card"
        style={{
          padding: "clamp(2.5rem, 6vw, 3.5rem)",
          borderColor: "rgba(244,124,32, 0.45)",
          background: "linear-gradient(160deg, rgba(244,124,32,0.07) 0%, #131f34 55%)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "54px",
            height: "54px",
            borderRadius: "999px",
            background: "#f47c20",
            color: "#070d18",
            marginBottom: "1.5rem",
          }}
        >
          <Icon name="check-circle" size={28} />
        </span>
        <h2 style={{ fontSize: "1.9rem", marginBottom: "1rem" }}>Enquiry received</h2>
        <p style={{ color: "#94a5c0", fontSize: "1rem", lineHeight: 1.7, maxWidth: "48ch" }}>
          Thanks{form.fullName ? `, ${form.fullName}` : ""} - that&apos;s with us. We&apos;ll be
          in touch within 24 hours to talk through lessons and find you a slot.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>Enquiry form</p>
      <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "1.25rem" }}>
        Start driving sooner
      </h2>
      <p style={{ color: "#94a5c0", fontSize: "1rem", lineHeight: 1.7, maxWidth: "52ch", marginBottom: "2.75rem" }}>
        A minute to fill in, and no payment details needed. Tell us roughly what you&apos;re after and
        we&apos;ll do the rest.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label" htmlFor="e-fullName">Full name *</label>
            <input className="field" id="e-fullName" type="text" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Your full name" />
          </div>
          <div>
            <label className="field-label" htmlFor="e-contactNumber">Contact number *</label>
            <input className="field" id="e-contactNumber" type="tel" name="contactNumber" value={form.contactNumber} onChange={handleChange} required placeholder="07700 000000" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label" htmlFor="e-email">Email address *</label>
            <input className="field" id="e-email" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
          <div>
            <label className="field-label" htmlFor="e-location">Your location *</label>
            <input className="field" id="e-location" type="text" name="location" value={form.location} onChange={handleChange} required placeholder="Town or postcode" />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="e-message">How can we help? *</label>
          <textarea
            className="field"
            id="e-message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            style={{ height: "170px", resize: "vertical" }}
            placeholder="Type of lesson, experience level, preferred times, or anything you want to ask…"
          />
        </div>

        {error && (
          <div
            role="alert"
            style={{
              display: "flex",
              gap: "0.65rem",
              alignItems: "flex-start",
              background: "rgba(255, 107, 107, 0.09)",
              border: "1px solid rgba(255, 107, 107, 0.45)",
              borderRadius: "14px",
              padding: "0.9rem 1.1rem",
              color: "#ff6b6b",
              fontSize: "0.9rem",
              lineHeight: 1.55,
            }}
          >
            <span style={{ display: "inline-flex", marginTop: "1px", flexShrink: 0 }}>
              <Icon name="caution" size={17} />
            </span>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", marginTop: "0.35rem" }}>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-accent"
            style={{ opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Sending…" : "Submit enquiry"}
            {!loading && <span aria-hidden>→</span>}
          </button>
          <span style={{ color: "#63779a", fontSize: "0.82rem" }}>No deposit, no obligation.</span>
        </div>
      </form>
    </div>
  );
}
