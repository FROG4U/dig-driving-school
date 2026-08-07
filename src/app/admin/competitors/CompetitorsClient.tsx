"use client";

import { useState, useEffect, useCallback } from "react";

interface ScanExtras {
  canonical?: string;
  ogTitle?: string;
  ogDesc?: string;
  h3Tags?: string[];
  imageAlts?: string[];
  links?: { internal: number; external: number };
  schemaTypes?: string[];
  hasSchema?: boolean;
  hasOpenGraph?: boolean;
  wordCount?: number;
  bigrams?: string[];
  trigrams?: string[];
}

interface ParsedKeywords {
  keywords: string[];
  bigrams: string[];
  trigrams: string[];
  extras: ScanExtras;
}

interface Competitor {
  id: string;
  name: string;
  url: string;
  metaTitle?: string;
  metaDesc?: string;
  h1Tags?: string;
  h2Tags?: string;
  topKeywords?: string;
  pageTitle?: string;
  lastScanned?: string;
  createdAt: string;
}

function parseJSON<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

function parseScanData(val?: string | null): ParsedKeywords {
  const raw = parseJSON<unknown>(val, null);
  if (!raw || typeof raw !== "object" || !("keywords" in (raw as object))) {
    // Legacy: plain array
    return { keywords: parseJSON<string[]>(val, []), bigrams: [], trigrams: [], extras: {} };
  }
  const r = raw as ParsedKeywords;
  return {
    keywords: r.keywords || [],
    bigrams: r.bigrams || [],
    trigrams: r.trigrams || [],
    extras: r.extras || {},
  };
}

function timeSince(dateStr: string) {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function Tag({ children, color = "grey" }: { children: React.ReactNode; color?: "blue" | "green" | "yellow" | "red" | "grey" }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    blue:   { bg: "#f0f6fc", text: "#2271b1", border: "#bdd7f0" },
    green:  { bg: "#e6f4ea", text: "#1e7e34", border: "#b8dfc0" },
    yellow: { bg: "#fef9e7", text: "#7a5c0a", border: "#f0d799" },
    red:    { bg: "#fce8e8", text: "#c0392b", border: "#f5c2c2" },
    grey:   { bg: "#f6f7f7", text: "#50575e", border: "#e2e4e7" },
  };
  const s = styles[color];
  return (
    <span style={{ fontSize: "0.75rem", backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}`, borderRadius: "3px", padding: "0.2rem 0.5rem", display: "inline-block" }}>
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.45rem" }}>
      {children}
    </div>
  );
}

export default function CompetitorsClient() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<string | null>(null);
  const [scanError, setScanError] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addName, setAddName] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"competitors" | "keywords">("competitors");
  const [kwTab, setKwTab] = useState<"single" | "phrases">("phrases");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/competitors");
      const data = await res.json();
      setCompetitors(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!addName.trim() || !addUrl.trim()) { setError("Both name and URL are required."); return; }
    let url = addUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName.trim(), url }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to add"); }
      else { setAddName(""); setAddUrl(""); await load(); }
    } catch { setError("Network error - check server is running"); }
    setAdding(false);
  }

  async function handleScan(id: string) {
    setScanning(id);
    setScanError((p) => ({ ...p, [id]: "" }));
    try {
      const res = await fetch(`/api/admin/competitors/${id}/scan`, { method: "POST" });
      if (res.ok) {
        const updated: Competitor = await res.json();
        setCompetitors((prev) => prev.map((c) => (c.id === id ? updated : c)));
        setExpanded(id);
      } else {
        const d = await res.json();
        setScanError((p) => ({ ...p, [id]: d.error || "Scan failed" }));
      }
    } catch { setScanError((p) => ({ ...p, [id]: "Network error during scan" })); }
    setScanning(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this competitor?")) return;
    setDeleting(id);
    await fetch(`/api/admin/competitors/${id}`, { method: "DELETE" });
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
    if (expanded === id) setExpanded(null);
    setDeleting(null);
  }

  // ─── Combined keyword bank ────────────────────────────────────────────
  const allSingle: Record<string, { count: number; sources: string[] }> = {};
  const allPhrases: Record<string, { count: number; sources: string[] }> = {};

  for (const c of competitors) {
    const { keywords, bigrams, trigrams } = parseScanData(c.topKeywords);
    const allKws = [...keywords];
    allKws.forEach((kw, idx) => {
      if (!allSingle[kw]) allSingle[kw] = { count: 0, sources: [] };
      allSingle[kw].count += (allKws.length - idx);
      if (!allSingle[kw].sources.includes(c.name)) allSingle[kw].sources.push(c.name);
    });
    [...bigrams, ...trigrams].forEach((ph, idx) => {
      if (!allPhrases[ph]) allPhrases[ph] = { count: 0, sources: [] };
      allPhrases[ph].count += (bigrams.length + trigrams.length - idx);
      if (!allPhrases[ph].sources.includes(c.name)) allPhrases[ph].sources.push(c.name);
    });
  }

  const sortedSingle = Object.entries(allSingle).sort((a, b) => b[1].count - a[1].count).slice(0, 60);
  const sortedPhrases = Object.entries(allPhrases).sort((a, b) => b[1].count - a[1].count).slice(0, 50);
  const scannedCount = competitors.filter((c) => c.lastScanned).length;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1d2327", margin: 0 }}>🔍 Competitor SEO Intelligence</h1>
        <p style={{ color: "#50575e", fontSize: "0.85rem", margin: "0.3rem 0 0" }}>
          Scan competitors to extract their SEO signals, keywords, and headings - then use them to outrank on Google.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Competitors", value: competitors.length, color: "#2271b1", border: "#2271b1" },
          { label: "Scanned", value: scannedCount, color: "#1e7e34", border: "#1e7e34" },
          { label: "Keywords", value: sortedSingle.length, color: "#7a5c0a", border: "#7a5c0a" },
          { label: "Phrases", value: sortedPhrases.length, color: "#8b5cf6", border: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderTop: `3px solid ${s.border}`, borderRadius: "3px", padding: "0.9rem 1.1rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "1.7rem", fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "#50575e", marginTop: "0.15rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #c3c4c7", marginBottom: "1.25rem" }}>
        {(["competitors", "keywords"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: "none", border: "none",
            borderBottom: activeTab === tab ? "3px solid #2271b1" : "3px solid transparent",
            color: activeTab === tab ? "#2271b1" : "#50575e",
            fontWeight: activeTab === tab ? 700 : 400,
            fontSize: "0.88rem", padding: "0.6rem 1.2rem", cursor: "pointer",
          }}>
            {tab === "competitors" ? `Competitors (${competitors.length})` : `Keyword Bank`}
          </button>
        ))}
      </div>

      {/* ── COMPETITORS TAB ─────────────────────────────────────────────── */}
      {activeTab === "competitors" && (
        <>
          {/* Add form */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1d2327", marginBottom: "0.85rem" }}>Add Competitor Website</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "1 1 160px" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#1d2327", marginBottom: "0.25rem" }}>Business Name</label>
                <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. City Driving School"
                  style={{ width: "100%", padding: "0.45rem 0.7rem", border: "1px solid #c3c4c7", borderRadius: "3px", fontSize: "0.88rem", color: "#1d2327", backgroundColor: "#fff", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: "2 1 240px" }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#1d2327", marginBottom: "0.25rem" }}>Website URL</label>
                <input value={addUrl} onChange={(e) => setAddUrl(e.target.value)} placeholder="e.g. https://citydrivingschool.co.uk"
                  style={{ width: "100%", padding: "0.45rem 0.7rem", border: "1px solid #c3c4c7", borderRadius: "3px", fontSize: "0.88rem", color: "#1d2327", backgroundColor: "#fff", boxSizing: "border-box" }} />
              </div>
              <button type="submit" disabled={adding}
                style={{ padding: "0.45rem 1.2rem", backgroundColor: "#2271b1", color: "#fff", border: "none", borderRadius: "3px", fontWeight: 700, fontSize: "0.88rem", cursor: adding ? "not-allowed" : "pointer", opacity: adding ? 0.7 : 1, whiteSpace: "nowrap" }}>
                {adding ? "Adding…" : "+ Add Competitor"}
              </button>
            </form>
            {error && <p style={{ color: "#d63638", fontSize: "0.82rem", marginTop: "0.5rem", margin: "0.5rem 0 0" }}>{error}</p>}
          </div>

          {/* Tip banner */}
          <div style={{ backgroundColor: "#f0f6fc", border: "1px solid #bdd7f0", borderLeft: "3px solid #2271b1", borderRadius: "3px", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.82rem", color: "#2271b1" }}>
            💡 <strong>How to use:</strong> Add your local competitors (driving schools near you), click <strong>Scan Now</strong> to extract their SEO data, then check the <strong>Keyword Bank</strong> tab to see which keywords to target on your own pages.
          </div>

          {loading ? (
            <p style={{ color: "#50575e", fontSize: "0.88rem" }}>Loading…</p>
          ) : competitors.length === 0 ? (
            <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "3rem", textAlign: "center", color: "#8c8f94", fontSize: "0.88rem" }}>
              No competitors added yet. Add a competitor above and click <strong>Scan Now</strong> to begin.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {competitors.map((c) => {
                const h1s = parseJSON<string[]>(c.h1Tags, []);
                const h2s = parseJSON<string[]>(c.h2Tags, []);
                const { keywords, bigrams, trigrams, extras } = parseScanData(c.topKeywords);
                const isExpanded = expanded === c.id;
                const isScanning = scanning === c.id;

                return (
                  <div key={c.id} style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "center", padding: "0.9rem 1.25rem", gap: "1rem", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: "#1d2327", fontSize: "0.95rem" }}>{c.name}</div>
                        <a href={c.url} target="_blank" rel="noreferrer" style={{ color: "#2271b1", fontSize: "0.78rem", textDecoration: "none" }}>{c.url}</a>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        {c.lastScanned ? (
                          <span style={{ fontSize: "0.72rem", color: "#50575e", backgroundColor: "#f6f7f7", padding: "0.15rem 0.5rem", borderRadius: "3px", border: "1px solid #e2e4e7" }}>
                            Scanned {timeSince(c.lastScanned)}
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "#7a5c0a", backgroundColor: "#fef9e7", padding: "0.15rem 0.5rem", borderRadius: "3px", border: "1px solid #f0d799" }}>
                            Not yet scanned
                          </span>
                        )}

                        <button onClick={() => handleScan(c.id)} disabled={!!scanning}
                          style={{ padding: "0.35rem 0.85rem", backgroundColor: isScanning ? "#f0f6fc" : "#2271b1", color: isScanning ? "#2271b1" : "#fff", border: isScanning ? "1px solid #b0d0e8" : "none", borderRadius: "3px", fontSize: "0.8rem", fontWeight: 700, cursor: scanning ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                          {isScanning ? "⏳ Scanning…" : c.lastScanned ? "🔄 Re-scan" : "🔍 Scan Now"}
                        </button>

                        {c.lastScanned && (
                          <button onClick={() => setExpanded(isExpanded ? null : c.id)}
                            style={{ padding: "0.35rem 0.85rem", backgroundColor: "#f6f7f7", color: "#50575e", border: "1px solid #e2e4e7", borderRadius: "3px", fontSize: "0.78rem", cursor: "pointer" }}>
                            {isExpanded ? "▲ Hide" : "▼ View Data"}
                          </button>
                        )}

                        <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                          style={{ background: "none", border: "none", color: "#d63638", fontSize: "0.78rem", cursor: "pointer", padding: "0.35rem 0.4rem", textDecoration: "underline" }}>
                          {deleting === c.id ? "…" : "Remove"}
                        </button>
                      </div>
                    </div>

                    {/* Scan error */}
                    {scanError[c.id] && (
                      <div style={{ backgroundColor: "#fce8e8", borderTop: "1px solid #f5c2c2", padding: "0.6rem 1.25rem", fontSize: "0.82rem", color: "#c0392b" }}>
                        ⚠️ {scanError[c.id]}
                      </div>
                    )}

                    {/* Expanded data */}
                    {isExpanded && c.lastScanned && (
                      <div style={{ borderTop: "1px solid #e2e4e7", backgroundColor: "#fafafa" }}>

                        {/* Quick SEO signals strip */}
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", padding: "0.75rem 1.25rem", borderBottom: "1px solid #e2e4e7", backgroundColor: "#f6f7f7" }}>
                          <Tag color={extras.hasOpenGraph ? "green" : "red"}>
                            {extras.hasOpenGraph ? "✓ Open Graph" : "✗ No Open Graph"}
                          </Tag>
                          <Tag color={extras.hasSchema ? "green" : "yellow"}>
                            {extras.hasSchema ? "✓ Schema Markup" : "✗ No Schema"}
                          </Tag>
                          {extras.wordCount && (
                            <Tag color={extras.wordCount > 500 ? "green" : "yellow"}>
                              📝 {extras.wordCount.toLocaleString()} words
                            </Tag>
                          )}
                          {extras.links && (
                            <Tag color="blue">🔗 {extras.links.internal} internal / {extras.links.external} external links</Tag>
                          )}
                          {extras.schemaTypes && extras.schemaTypes.length > 0 && (
                            <Tag color="green">Schema: {extras.schemaTypes.join(", ")}</Tag>
                          )}
                          {extras.canonical && (
                            <Tag color="grey">📌 Has canonical</Tag>
                          )}
                        </div>

                        <div style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.25rem" }}>

                          {/* Meta title */}
                          <div>
                            <SectionLabel>Meta Title</SectionLabel>
                            <div style={{ fontSize: "0.85rem", color: "#1d2327", backgroundColor: "#fff", border: "1px solid #e2e4e7", borderRadius: "3px", padding: "0.5rem 0.75rem", lineHeight: 1.4 }}>
                              {c.metaTitle || <em style={{ color: "#8c8f94" }}>Not found</em>}
                            </div>
                            {c.metaTitle && <div style={{ fontSize: "0.72rem", color: c.metaTitle.length > 65 ? "#d63638" : "#1e7e34", marginTop: "0.2rem" }}>{c.metaTitle.length} chars {c.metaTitle.length > 65 ? "(too long)" : "(good)"}</div>}
                          </div>

                          {/* Meta description */}
                          <div>
                            <SectionLabel>Meta Description</SectionLabel>
                            <div style={{ fontSize: "0.85rem", color: "#1d2327", backgroundColor: "#fff", border: "1px solid #e2e4e7", borderRadius: "3px", padding: "0.5rem 0.75rem", lineHeight: 1.4 }}>
                              {c.metaDesc || <em style={{ color: "#8c8f94" }}>Not found</em>}
                            </div>
                            {c.metaDesc && <div style={{ fontSize: "0.72rem", color: c.metaDesc.length > 165 ? "#d63638" : "#1e7e34", marginTop: "0.2rem" }}>{c.metaDesc.length} chars {c.metaDesc.length > 165 ? "(too long)" : "(good)"}</div>}
                          </div>

                          {/* H1 tags */}
                          <div>
                            <SectionLabel>H1 Headings ({h1s.length})</SectionLabel>
                            {h1s.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                {h1s.map((h, i) => (
                                  <div key={i} style={{ fontSize: "0.83rem", color: "#1d2327", backgroundColor: "#f0f6fc", border: "1px solid #bdd7f0", borderRadius: "3px", padding: "0.3rem 0.65rem" }}>{h}</div>
                                ))}
                              </div>
                            ) : <em style={{ color: "#8c8f94", fontSize: "0.82rem" }}>None found</em>}
                          </div>

                          {/* H2 tags */}
                          <div>
                            <SectionLabel>H2 Headings ({h2s.length})</SectionLabel>
                            {h2s.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                {h2s.slice(0, 8).map((h, i) => (
                                  <div key={i} style={{ fontSize: "0.83rem", color: "#1d2327", backgroundColor: "#fff", border: "1px solid #e2e4e7", borderRadius: "3px", padding: "0.3rem 0.65rem" }}>{h}</div>
                                ))}
                                {h2s.length > 8 && <div style={{ fontSize: "0.72rem", color: "#8c8f94" }}>+{h2s.length - 8} more H2 tags</div>}
                              </div>
                            ) : <em style={{ color: "#8c8f94", fontSize: "0.82rem" }}>None found</em>}
                          </div>

                          {/* Keyword phrases (bigrams + trigrams) */}
                          {(bigrams.length > 0 || trigrams.length > 0) && (
                            <div style={{ gridColumn: "1 / -1" }}>
                              <SectionLabel>Keyword Phrases (2–3 word)</SectionLabel>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                                {[...trigrams.slice(0, 5).map((t) => ({ t, type: "tri" })), ...bigrams.slice(0, 12).map((b) => ({ t: b, type: "bi" }))].map(({ t, type }, i) => (
                                  <span key={i} style={{
                                    fontSize: "0.78rem",
                                    backgroundColor: type === "tri" ? "#e6f4ea" : "#f0f6fc",
                                    color: type === "tri" ? "#1e7e34" : "#2271b1",
                                    border: `1px solid ${type === "tri" ? "#b8dfc0" : "#bdd7f0"}`,
                                    borderRadius: "3px", padding: "0.2rem 0.55rem", fontWeight: 600,
                                  }}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Single keywords */}
                          {keywords.length > 0 && (
                            <div style={{ gridColumn: "1 / -1" }}>
                              <SectionLabel>Single Keywords ({keywords.length})</SectionLabel>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                                {keywords.map((kw, i) => (
                                  <span key={i} style={{
                                    fontSize: "0.75rem",
                                    backgroundColor: i < 5 ? "#e6f4ea" : i < 15 ? "#fef9e7" : "#f6f7f7",
                                    color: i < 5 ? "#1e7e34" : i < 15 ? "#7a5c0a" : "#50575e",
                                    border: `1px solid ${i < 5 ? "#b8dfc0" : i < 15 ? "#f0d799" : "#e2e4e7"}`,
                                    borderRadius: "3px", padding: "0.15rem 0.5rem",
                                    fontWeight: i < 10 ? 600 : 400,
                                  }}>{kw}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Image alts */}
                          {extras.imageAlts && extras.imageAlts.length > 0 && (
                            <div style={{ gridColumn: "1 / -1" }}>
                              <SectionLabel>Image Alt Texts ({extras.imageAlts.length})</SectionLabel>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                                {extras.imageAlts.map((alt, i) => (
                                  <span key={i} style={{ fontSize: "0.75rem", backgroundColor: "#fef9e7", color: "#7a5c0a", border: "1px solid #f0d799", borderRadius: "3px", padding: "0.15rem 0.5rem" }}>{alt}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Google-style preview */}
                        <div style={{ margin: "0 1.25rem 1.25rem", padding: "1rem", border: "1px solid #e2e4e7", borderRadius: "8px", backgroundColor: "#fff" }}>
                          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#8c8f94", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>How they appear in Google</div>
                          <div style={{ fontFamily: "arial, sans-serif" }}>
                            <div style={{ fontSize: "0.72rem", color: "#006621", marginBottom: "0.1rem" }}>{c.url.replace(/^https?:\/\//, "")}</div>
                            <div style={{ fontSize: "1rem", color: "#1a0dab", lineHeight: 1.3, marginBottom: "0.25rem" }}>
                              {(c.metaTitle || c.pageTitle || c.name).slice(0, 65)}
                            </div>
                            <div style={{ fontSize: "0.83rem", color: "#4d5156", lineHeight: 1.4 }}>
                              {(c.metaDesc || "No meta description found.").slice(0, 160)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── KEYWORD BANK TAB ─────────────────────────────────────────────── */}
      {activeTab === "keywords" && (
        <div>
          {sortedSingle.length === 0 && sortedPhrases.length === 0 ? (
            <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "3rem", textAlign: "center", color: "#8c8f94", fontSize: "0.88rem" }}>
              No keywords yet. Add competitors in the Competitors tab and click <strong>Scan Now</strong>.
            </div>
          ) : (
            <>
              <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderLeft: "3px solid #1e7e34", borderRadius: "3px", padding: "0.85rem 1rem", marginBottom: "1.25rem" }}>
                <p style={{ fontSize: "0.84rem", color: "#1d2327", margin: 0 }}>
                  <strong>🎯 How to use this:</strong> These are the keywords your competitors are targeting. Add the top ones (green) to your own page <strong>meta titles, H1 headings, and content</strong> to rank higher than them on Google.
                </p>
              </div>

              {/* Sub-tabs: Single vs Phrases */}
              <div style={{ display: "flex", borderBottom: "1px solid #c3c4c7", marginBottom: "1rem" }}>
                {(["phrases", "single"] as const).map((t) => (
                  <button key={t} onClick={() => setKwTab(t)} style={{
                    background: "none", border: "none",
                    borderBottom: kwTab === t ? "3px solid #2271b1" : "3px solid transparent",
                    color: kwTab === t ? "#2271b1" : "#50575e",
                    fontWeight: kwTab === t ? 700 : 400,
                    fontSize: "0.85rem", padding: "0.5rem 1rem", cursor: "pointer",
                  }}>
                    {t === "phrases" ? `Keyword Phrases (${sortedPhrases.length})` : `Single Keywords (${sortedSingle.length})`}
                  </button>
                ))}
              </div>

              <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f6f7f7", borderBottom: "1px solid #e2e4e7" }}>
                      <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em", width: 36 }}>#</th>
                      <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {kwTab === "phrases" ? "Phrase" : "Keyword"}
                      </th>
                      <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em" }}>Found in</th>
                      <th style={{ padding: "0.6rem 1rem 0.6rem 0", textAlign: "right", fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(kwTab === "phrases" ? sortedPhrases : sortedSingle).map(([kw, data], i) => {
                      const maxCount = kwTab === "phrases" ? sortedPhrases[0]?.[1]?.count : sortedSingle[0]?.[1]?.count;
                      const pct = Math.round((data.count / (maxCount || 1)) * 100);
                      return (
                        <tr key={kw} style={{ borderBottom: "1px solid #f0f0f1" }}>
                          <td style={{ padding: "0.6rem 1rem", color: "#c3c4c7", fontSize: "0.75rem" }}>{i + 1}</td>
                          <td style={{ padding: "0.6rem 1rem" }}>
                            <span style={{ fontWeight: i < 10 ? 700 : 500, color: i < 5 ? "#1e7e34" : i < 20 ? "#1d2327" : "#50575e", fontSize: "0.9rem" }}>
                              {kw}
                            </span>
                            {i < 10 && <span style={{ marginLeft: "0.4rem", fontSize: "0.68rem", backgroundColor: "#e6f4ea", color: "#1e7e34", border: "1px solid #b8dfc0", borderRadius: "3px", padding: "0.05rem 0.35rem", fontWeight: 700 }}>Target this</span>}
                          </td>
                          <td style={{ padding: "0.6rem 1rem" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                              {data.sources.map((s) => (
                                <span key={s} style={{ fontSize: "0.7rem", backgroundColor: "#f0f6fc", color: "#2271b1", border: "1px solid #bdd7f0", borderRadius: "3px", padding: "0.05rem 0.35rem" }}>{s}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: "0.6rem 1rem 0.6rem 0", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                              <div style={{ width: "56px", height: "6px", backgroundColor: "#e2e4e7", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, backgroundColor: i < 5 ? "#1e7e34" : i < 20 ? "#2271b1" : "#8c8f94", borderRadius: "3px" }} />
                              </div>
                              <span style={{ fontSize: "0.7rem", color: "#8c8f94", minWidth: "24px", textAlign: "right" }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
