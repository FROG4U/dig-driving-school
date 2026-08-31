"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site-config";
import { toSlugParam } from "@/lib/slug";
import { keywordAppearsIn } from "@/lib/keyword-match";

interface SeoData {
  metaTitle: string;
  metaDesc: string;
  h1: string;
  focusKeyword: string;
  keywords: string;
  notes: string;
}

function charScore(val: string, min: number, ideal: number, max: number) {
  const l = val.length;
  if (l === 0) return "empty";
  if (l < min) return "short";
  if (l <= ideal) return "good";
  if (l <= max) return "ok";
  return "long";
}

const scoreColor: Record<string, string> = {
  empty: "#8c8f94", short: "#7a5c0a", good: "#1e7e34", ok: "#2271b1", long: "#d63638",
};
const scoreLabel: Record<string, string> = {
  empty: "Empty", short: "Too short", good: "Good ✓", ok: "Acceptable", long: "Too long",
};

export default function SeoEditorClient({
  slug, pageTitle, pageType,
}: {
  slug: string; pageTitle: string; pageType: string;
}) {
  const [form, setForm] = useState<SeoData>({ metaTitle: "", metaDesc: "", h1: "", focusKeyword: "", keywords: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [h2Suggestions, setH2Suggestions] = useState<string[]>([]);
  const [generateInfo, setGenerateInfo] = useState<{ competitorCount: number; keywordsUsed: number } | null>(null);
  const [showGenerateBanner, setShowGenerateBanner] = useState(false);

  const encodedSlug = toSlugParam(slug);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/seo/${encodedSlug}`);
      const data = await res.json();
      setForm({
        metaTitle: data.metaTitle ?? "",
        metaDesc: data.metaDesc ?? "",
        h1: data.h1 ?? "",
        focusKeyword: data.focusKeyword ?? "",
        keywords: data.keywords ?? "",
        notes: data.notes ?? "",
      });
    } catch { /* ignore */ }
    setLoading(false);
  }, [encodedSlug]);

  useEffect(() => { load(); }, [load]);

  function update(key: keyof SeoData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    setShowGenerateBanner(false);
    try {
      const res = await fetch(`/api/admin/seo/${encodedSlug}/generate`, { method: "POST" });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Generate failed"); setGenerating(false); return; }
      const data = await res.json();
      setForm({
        metaTitle: data.metaTitle ?? "",
        metaDesc: data.metaDesc ?? "",
        h1: data.h1 ?? "",
        focusKeyword: data.focusKeyword ?? "",
        keywords: data.keywords ?? "",
        notes: data.notes ?? "",
      });
      setH2Suggestions(data.h2Suggestions ?? []);
      setGenerateInfo({ competitorCount: data.competitorCount, keywordsUsed: data.keywordsUsed });
      setShowGenerateBanner(true);
      setSaved(true);
    } catch { setError("Network error during generation"); }
    setGenerating(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/seo/${encodedSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Save failed"); }
      else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } catch { setError("Network error"); }
    setSaving(false);
  }

  const titleScore = charScore(form.metaTitle, 30, 60, 65);
  const descScore = charScore(form.metaDesc, 100, 155, 165);

  const previewTitle = form.metaTitle || `${pageTitle} | DIG Driving School`;
  const previewDesc = form.metaDesc || `Professional driving lessons in ${SITE.location} and surrounding areas.`;
  // Show the real domain - a hardcoded one made the preview a poor guide to how
  // the snippet actually looks in Google.
  const previewUrl = `${SITE.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}${slug === "/" ? "" : slug}`;

  if (loading) return <div style={{ color: "#50575e", padding: "2rem" }}>Loading SEO data…</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <Link href="/admin/pages" style={{ color: "#2271b1", fontSize: "0.82rem", textDecoration: "none" }}>← Pages</Link>
            <span style={{ color: "#c3c4c7", fontSize: "0.82rem" }}>/</span>
            <span style={{ color: "#50575e", fontSize: "0.82rem" }}>SEO Editor</span>
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 600, color: "#1d2327", margin: 0 }}>SEO: {pageTitle}</h1>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ backgroundColor: pageType === "Location" ? "#f0f6fc" : "#f6f7f7", color: pageType === "Location" ? "#2271b1" : "#50575e", border: `1px solid ${pageType === "Location" ? "#bdd7f0" : "#e2e4e7"}`, borderRadius: "3px", fontSize: "0.72rem", fontWeight: 600, padding: "0.1rem 0.5rem" }}>{pageType}</span>
            <code style={{ fontSize: "0.78rem", color: "#50575e", backgroundColor: "#f6f7f7", padding: "0.1rem 0.4rem", borderRadius: "3px", border: "1px solid #e2e4e7" }}>{slug}</code>
            <a href={slug} target="_blank" rel="noreferrer" style={{ fontSize: "0.78rem", color: "#2271b1", textDecoration: "none" }}>View page ↗</a>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          {/* AI Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || saving}
            style={{
              padding: "0.5rem 1.2rem",
              background: generating ? "#f6f7f7" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: generating ? "#8c8f94" : "#fff",
              border: generating ? "1px solid #e2e4e7" : "none",
              borderRadius: "3px", fontWeight: 700, fontSize: "0.88rem",
              cursor: generating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "0.4rem",
            }}
          >
            {generating ? "⏳ Generating…" : "🤖 Generate SEO"}
          </button>

          <button
            form="seo-form" type="submit" disabled={saving || generating}
            style={{ padding: "0.5rem 1.2rem", backgroundColor: saved ? "#1e7e34" : "#2271b1", color: "#fff", border: "none", borderRadius: "3px", fontWeight: 700, fontSize: "0.88rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save SEO"}
          </button>
        </div>
      </div>

      {error && <div style={{ backgroundColor: "#fce8e8", border: "1px solid #f5c2c2", borderRadius: "3px", padding: "0.7rem 1rem", marginBottom: "1rem", color: "#c0392b", fontSize: "0.85rem" }}>{error}</div>}

      {/* Generate success banner */}
      {showGenerateBanner && generateInfo && (
        <div style={{ backgroundColor: "#e6f4ea", border: "1px solid #b8dfc0", borderLeft: "3px solid #1e7e34", borderRadius: "3px", padding: "0.85rem 1rem", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1e7e34", marginBottom: "0.2rem" }}>
            ✓ SEO generated & saved automatically
          </div>
          <div style={{ fontSize: "0.8rem", color: "#1d2327" }}>
            Built using <strong>{generateInfo.competitorCount} competitor(s)</strong> and <strong>{generateInfo.keywordsUsed} keywords</strong> from your Keyword Bank.
            Review the fields below and click <strong>Save SEO</strong> if you make any changes.
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: "1.25rem" }} className="lg:grid-cols-[1fr_340px]">

        {/* ── Left: form ───────────────────────────────────────── */}
        <div>
          <form id="seo-form" onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Meta Title */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1d2327" }}>
                  Meta Title <span style={{ color: "#d63638", fontSize: "0.75rem", fontWeight: 400 }}>⬡ Google uses this as your page headline in search results</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.72rem", color: form.metaTitle.length > 65 ? "#d63638" : "#50575e" }}>{form.metaTitle.length}/65</span>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: scoreColor[titleScore], backgroundColor: `${scoreColor[titleScore]}18`, borderRadius: "3px", padding: "0.1rem 0.45rem" }}>{scoreLabel[titleScore]}</span>
                </div>
              </div>
              <input value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)}
                placeholder={`e.g. Driving Lessons in ${SITE.location} | DIG Driving School`} maxLength={80}
                style={{ width: "100%", padding: "0.55rem 0.75rem", border: `1px solid ${titleScore === "good" ? "#b8dfc0" : "#c3c4c7"}`, borderRadius: "3px", fontSize: "0.9rem", color: "#1d2327", backgroundColor: "#fff", boxSizing: "border-box" }} />
              <div style={{ fontSize: "0.72rem", color: "#8c8f94", marginTop: "0.3rem" }}>Ideal: 50-60 chars. Include your main keyword + location. Appears in Google and browser tab.</div>
            </div>

            {/* Meta Description */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1d2327" }}>
                  Meta Description <span style={{ color: "#7a5c0a", fontSize: "0.75rem", fontWeight: 400 }}>⬡ The snippet under your title in Google</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.72rem", color: form.metaDesc.length > 165 ? "#d63638" : "#50575e" }}>{form.metaDesc.length}/165</span>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: scoreColor[descScore], backgroundColor: `${scoreColor[descScore]}18`, borderRadius: "3px", padding: "0.1rem 0.45rem" }}>{scoreLabel[descScore]}</span>
                </div>
              </div>
              <textarea value={form.metaDesc} onChange={(e) => update("metaDesc", e.target.value)} rows={3} maxLength={200}
                placeholder={`e.g. Book professional driving lessons in ${SITE.location} with DIG. Flexible hours, competitive prices, high pass rates.`}
                style={{ width: "100%", padding: "0.55rem 0.75rem", border: `1px solid ${descScore === "good" ? "#b8dfc0" : "#c3c4c7"}`, borderRadius: "3px", fontSize: "0.9rem", color: "#1d2327", backgroundColor: "#fff", resize: "vertical", boxSizing: "border-box" }} />
              <div style={{ fontSize: "0.72rem", color: "#8c8f94", marginTop: "0.3rem" }}>Ideal: 140-160 chars. Write to make people want to click. Include your keyword naturally.</div>
            </div>

            {/* H1 */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#1d2327", marginBottom: "0.5rem" }}>
                H1 Heading <span style={{ fontSize: "0.72rem", fontWeight: 400, color: "#50575e" }}>- The main visible headline on the page (only one per page)</span>
              </label>
              <input value={form.h1} onChange={(e) => update("h1", e.target.value)}
                placeholder={`e.g. Driving Lessons in ${SITE.location}`}
                style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #c3c4c7", borderRadius: "3px", fontSize: "0.9rem", color: "#1d2327", backgroundColor: "#fff", boxSizing: "border-box" }} />
              <div style={{ fontSize: "0.72rem", color: "#8c8f94", marginTop: "0.3rem" }}>This is the big headline shown at the top of the page, so write it for people as well as Google. Include your primary keyword. If you have typed a hero heading for this page in Content, that one wins.</div>
            </div>

            {/* H2 Suggestions */}
            {h2Suggestions.length > 0 && (
              <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderLeft: "3px solid #7c3aed", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1d2327", marginBottom: "0.25rem" }}>🤖 Generated H2 Headings</div>
                <div style={{ fontSize: "0.78rem", color: "#50575e", marginBottom: "0.85rem" }}>
                  Use these as section headings on the page. They help Google understand what your page covers.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {h2Suggestions.map((h2, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", backgroundColor: "#f6f7f7", border: "1px solid #e2e4e7", borderRadius: "3px", padding: "0.5rem 0.75rem" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#7c3aed", backgroundColor: "#f3f0ff", border: "1px solid #d8d0f5", borderRadius: "3px", padding: "0.1rem 0.35rem", flexShrink: 0 }}>H2</span>
                      <span style={{ fontSize: "0.88rem", color: "#1d2327", flex: 1 }}>{h2}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#7c3aed", marginTop: "0.75rem", backgroundColor: "#f3f0ff", border: "1px solid #d8d0f5", borderRadius: "3px", padding: "0.5rem 0.75rem" }}>
                  💡 Copy these headings into your page content. The more sections you have covering relevant keywords, the better you rank.
                </div>
              </div>
            )}

            {/* Focus Keyword */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#1d2327", marginBottom: "0.5rem" }}>Focus Keyword</label>
              <input value={form.focusKeyword} onChange={(e) => update("focusKeyword", e.target.value)}
                placeholder={`e.g. driving lessons ${SITE.location.toLowerCase()}`}
                style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #c3c4c7", borderRadius: "3px", fontSize: "0.9rem", color: "#1d2327", backgroundColor: "#fff", boxSizing: "border-box" }} />
              <div style={{ fontSize: "0.72rem", color: "#8c8f94", marginTop: "0.3rem" }}>The main phrase you want to rank #1 for on this page.</div>

              {form.focusKeyword && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.7rem" }}>
                  {[
                    { label: "In title", check: keywordAppearsIn(form.focusKeyword, form.metaTitle) },
                    { label: "In description", check: keywordAppearsIn(form.focusKeyword, form.metaDesc) },
                    { label: "In H1", check: keywordAppearsIn(form.focusKeyword, form.h1) },
                  ].map((item) => (
                    <span key={item.label} style={{ fontSize: "0.75rem", fontWeight: 600, backgroundColor: item.check ? "#e6f4ea" : "#fce8e8", color: item.check ? "#1e7e34" : "#c0392b", border: `1px solid ${item.check ? "#b8dfc0" : "#f5c2c2"}`, borderRadius: "3px", padding: "0.2rem 0.55rem" }}>
                      {item.check ? "✓" : "✗"} {item.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Keywords */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#1d2327", marginBottom: "0.5rem" }}>Additional Keywords</label>
              <textarea value={form.keywords} onChange={(e) => update("keywords", e.target.value)} rows={3}
                placeholder={`e.g. cheap driving lessons ${SITE.location.toLowerCase()}, intensive driving courses, learn to drive cheltenham`}
                style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #c3c4c7", borderRadius: "3px", fontSize: "0.9rem", color: "#1d2327", backgroundColor: "#fff", resize: "vertical", boxSizing: "border-box" }} />
              <div style={{ fontSize: "0.72rem", color: "#8c8f94", marginTop: "0.3rem" }}>Comma-separated. Taken from competitor keyword bank + your page topic.</div>
              {form.keywords && (
                <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                  {form.keywords.split(",").map((kw) => kw.trim()).filter(Boolean).map((kw) => (
                    <span key={kw} style={{ fontSize: "0.73rem", backgroundColor: "#f0f6fc", color: "#2271b1", border: "1px solid #bdd7f0", borderRadius: "3px", padding: "0.15rem 0.5rem" }}>{kw}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
              <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "#1d2327", marginBottom: "0.5rem" }}>Internal Notes</label>
              <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2}
                placeholder="Notes about this page's SEO strategy…"
                style={{ width: "100%", padding: "0.55rem 0.75rem", border: "1px solid #c3c4c7", borderRadius: "3px", fontSize: "0.88rem", color: "#1d2327", backgroundColor: "#fff", resize: "vertical", boxSizing: "border-box" }} />
            </div>

          </form>
        </div>

        {/* ── Right: preview + checklist ───────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Google preview */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.85rem" }}>Google Preview</div>
            <div style={{ border: "1px solid #e2e4e7", borderRadius: "8px", padding: "1rem", backgroundColor: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "linear-gradient(135deg,#4285F4 0%,#EA4335 33%,#FBBC05 66%,#34A853 100%)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.68rem", color: "#8c8f94", fontWeight: 600 }}>Google Search Preview</span>
              </div>
              <div style={{ fontFamily: "arial, sans-serif" }}>
                <div style={{ fontSize: "0.72rem", color: "#006621", marginBottom: "0.1rem", wordBreak: "break-all" }}>{previewUrl}</div>
                <div style={{ fontSize: "1rem", color: "#1a0dab", lineHeight: 1.3, marginBottom: "0.3rem" }}>
                  {previewTitle.length > 65 ? previewTitle.slice(0, 62) + "…" : previewTitle}
                </div>
                <div style={{ fontSize: "0.83rem", color: "#4d5156", lineHeight: 1.4 }}>
                  {previewDesc.length > 160 ? previewDesc.slice(0, 157) + "…" : previewDesc}
                </div>
              </div>
            </div>
          </div>

          {/* SEO Checklist */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.85rem" }}>SEO Checklist</div>
            {[
              { label: "Meta title set", check: form.metaTitle.length >= 30 },
              { label: "Title good length (30-65)", check: form.metaTitle.length >= 30 && form.metaTitle.length <= 65 },
              { label: "Meta description set", check: form.metaDesc.length >= 100 },
              { label: "Description good length (100-165)", check: form.metaDesc.length >= 100 && form.metaDesc.length <= 165 },
              { label: "H1 heading set", check: form.h1.length > 0 },
              { label: "Focus keyword set", check: form.focusKeyword.length > 0 },
              { label: "Keyword in title", check: keywordAppearsIn(form.focusKeyword, form.metaTitle) },
              { label: "Keyword in description", check: keywordAppearsIn(form.focusKeyword, form.metaDesc) },
              { label: "Keyword in H1", check: keywordAppearsIn(form.focusKeyword, form.h1) },
              { label: "Additional keywords added", check: form.keywords.length > 0 },
            ].map((item) => {
              const done = item.check;
              return (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0", borderBottom: "1px solid #f6f7f7" }}>
                  <span style={{ color: done ? "#1e7e34" : "#c3c4c7", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0, width: "16px" }}>{done ? "✓" : "○"}</span>
                  <span style={{ fontSize: "0.8rem", color: done ? "#1d2327" : "#8c8f94" }}>{item.label}</span>
                </div>
              );
            })}
            {/* Score */}
            {(() => {
              const checks = [
                form.metaTitle.length >= 30, form.metaTitle.length <= 65,
                form.metaDesc.length >= 100, form.metaDesc.length <= 165,
                form.h1.length > 0, form.focusKeyword.length > 0,
                form.metaTitle.toLowerCase().includes(form.focusKeyword.toLowerCase()),
                form.metaDesc.toLowerCase().includes(form.focusKeyword.toLowerCase()),
                form.h1.toLowerCase().includes(form.focusKeyword.toLowerCase()),
                form.keywords.length > 0,
              ];
              const score = checks.filter(Boolean).length;
              const pct = Math.round((score / checks.length) * 100);
              const color = pct >= 80 ? "#1e7e34" : pct >= 50 ? "#7a5c0a" : "#d63638";
              return (
                <div style={{ marginTop: "0.85rem", padding: "0.65rem 0.75rem", backgroundColor: `${color}12`, border: `1px solid ${color}40`, borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color }}>SEO Score: {pct}%</span>
                  <div style={{ width: "80px", height: "6px", backgroundColor: "#e2e4e7", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: "3px" }} />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Tips */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderLeft: "3px solid #7c3aed", borderRadius: "3px", padding: "1rem 1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c3aed", marginBottom: "0.5rem" }}>💡 Quick SEO Wins</div>
            <ul style={{ margin: 0, padding: "0 0 0 1rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {[
                `Include your location (e.g. '${SITE.location}') in title & H1`,
                "Use competitor phrases from the Keyword Bank",
                "Make meta title under 60 chars to avoid being cut off",
                "Write descriptions that explain why DIG is better",
                "Each location page needs its own unique description",
              ].map((tip) => (
                <li key={tip} style={{ fontSize: "0.78rem", color: "#50575e", lineHeight: 1.5 }}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
