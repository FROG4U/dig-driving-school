"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", lessons: "Standard Manual Lesson", area: "", message: "" });
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
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.name,
          contactNumber: form.phone,
          email: form.email,
          location: form.area || "Not specified",
          message: `Lesson/course: ${form.lessons}\n\n${form.message || "(no message)"}`,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <h2 style={{ fontSize: "1.9rem", marginBottom: "1rem" }}>Enquiry sent</h2>
        <p style={{ color: "#94a5c0", fontSize: "1rem", lineHeight: 1.7, maxWidth: "48ch" }}>
          Thanks{form.name ? `, ${form.name}` : ""} &mdash; we&apos;ve got it. We&apos;ll be in touch within
          24 hours to confirm your lesson and sort out pick-up details.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow" style={{ marginBottom: "1.5rem" }}>Send a message</p>
      <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "1.25rem" }}>
        Tell us what you need
      </h2>
      <p style={{ color: "#94a5c0", fontSize: "1rem", lineHeight: 1.7, maxWidth: "52ch", marginBottom: "2.75rem" }}>
        Fill this in and we&apos;ll come back to you with availability and a plan. Nothing is booked
        and nothing is charged until you say so.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label" htmlFor="c-name">Full name *</label>
            <input className="field" id="c-name" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" />
          </div>
          <div>
            <label className="field-label" htmlFor="c-phone">Phone number *</label>
            <input className="field" id="c-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="07700 000000" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="field-label" htmlFor="c-email">Email address *</label>
            <input className="field" id="c-email" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
          <div>
            <label className="field-label" htmlFor="c-area">Your area / town</label>
            <input className="field" id="c-area" type="text" name="area" value={form.area} onChange={handleChange} placeholder="Where you'd like to be picked up" />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="c-lessons">Lesson / course type</label>
          <select className="field" id="c-lessons" name="lessons" value={form.lessons} onChange={handleChange}>
            <optgroup label="Manual Lessons">
              <option>Standard Manual Lesson (1hr)</option>
              <option>Standard Manual Lesson (2hr)</option>
              <option>Manual Block Booking (5 lessons)</option>
              <option>Manual Block Booking (10 lessons)</option>
            </optgroup>
            <optgroup label="Automatic Lessons">
              <option>Standard Automatic Lesson (1hr)</option>
              <option>Standard Automatic Lesson (2hr)</option>
              <option>Automatic Block Booking (5 lessons)</option>
              <option>Automatic Block Booking (10 lessons)</option>
            </optgroup>
            <optgroup label="Intensive Courses">
              <option>Intensive - Start to Finish (40hrs)</option>
              <option>Intensive - Semi-Intensive (30hrs)</option>
              <option>Intensive - Midway Pass (20hrs)</option>
              <option>Intensive - Test Booster (15hrs)</option>
            </optgroup>
            <optgroup label="Other">
              <option>Pass Plus</option>
              <option>Motorway / Refresher</option>
              <option>Eco-Driving Course</option>
              <option>Not sure yet</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="c-message">Additional info</label>
          <textarea
            className="field"
            id="c-message"
            name="message"
            value={form.message}
            onChange={handleChange}
            style={{ height: "150px", resize: "vertical" }}
            placeholder="Preferred days and times, your experience level, pick-up address, any questions…"
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
            {loading ? "Sending…" : "Send enquiry"}
            {!loading && <span aria-hidden>→</span>}
          </button>
          <span style={{ color: "#63779a", fontSize: "0.82rem" }}>We reply within 24 hours.</span>
        </div>
      </form>
    </div>
  );
}
