"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import type { BannerData } from "@/lib/content";

interface Props {
  slug: string;
  title: string;
  initialBanner: BannerData;
}

function fmtBytes(n?: number) {
  if (!n && n !== 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function ContentEditorClient({ slug, title, initialBanner }: Props) {
  const [banner, setBanner] = useState<BannerData>({ overlay: 55, ...initialBanner });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<{ savedPct: number; before: number; after: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof BannerData>(key: K, val: BannerData[K]) {
    setBanner((b) => ({ ...b, [key]: val }));
    setSaved(false);
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    setUploadInfo(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      set("imageUrl", json.url);
      setUploadInfo({ savedPct: json.savedPct, before: json.originalSize, after: json.sizeBytes });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/content/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionKey: "banner", data: banner }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Save failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const previewBg = banner.imageUrl
    ? `linear-gradient(rgba(13,27,42,${(banner.overlay ?? 55) / 100}), rgba(13,27,42,${(banner.overlay ?? 55) / 100})), url("${banner.imageUrl}")`
    : "linear-gradient(135deg, #0d1b2a 0%, #1a2d45 50%, #1a1a1a 100%)";

  const labelStyle: React.CSSProperties = { fontSize: "0.78rem", fontWeight: 600, color: "#1d2327", display: "block", marginBottom: "0.3rem" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.55rem 0.7rem", border: "1px solid #c3c4c7", borderRadius: "6px", fontSize: "0.88rem", fontFamily: "inherit" };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "0.4rem" }}>
        <div>
          <Link href="/admin/content" style={{ fontSize: "0.78rem", color: "#2271b1", textDecoration: "none" }}>← All pages</Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1d2327", margin: "0.2rem 0 0" }}>{title}</h1>
          <code style={{ fontSize: "0.74rem", color: "#8c8f94" }}>{slug}</code>
        </div>
        <a href={slug} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#2271b1", textDecoration: "none" }}>View page ↗</a>
      </div>

      {/* Section: Banner */}
      <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "8px", overflow: "hidden", marginTop: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "0.8rem 1.2rem", borderBottom: "1px solid #e2e4e7", backgroundColor: "#f6f7f7", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1rem" }}>🖼️</span>
          <span style={{ fontWeight: 700, color: "#1d2327", fontSize: "0.92rem" }}>Banner / Hero</span>
          <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#8c8f94" }}>Section 1</span>
        </div>

        <div style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
          {/* Live preview */}
          <div>
            <span style={labelStyle}>Live preview</span>
            <div style={{
              background: previewBg, backgroundSize: "cover", backgroundPosition: "center",
              borderRadius: "10px", padding: "2.5rem 1.5rem", textAlign: "center", color: "#fff",
              border: "1px solid #e2e4e7",
            }}>
              {banner.eyebrow && (
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", color: "#a8c5e8", marginBottom: "0.6rem" }}>
                  {banner.eyebrow}
                </div>
              )}
              <div style={{ fontSize: "1.7rem", fontWeight: 800, textTransform: "uppercase", lineHeight: 1.1 }}>
                {banner.heading || "Heading"}
              </div>
              {banner.subheading && (
                <p style={{ fontSize: "0.85rem", color: "#cdd9e6", maxWidth: "440px", margin: "0.75rem auto 0", lineHeight: 1.55 }}>
                  {banner.subheading}
                </p>
              )}
            </div>
          </div>

          {/* Text fields */}
          <div>
            <label style={labelStyle}>Eyebrow (small label above heading)</label>
            <input style={inputStyle} value={banner.eyebrow ?? ""} onChange={(e) => set("eyebrow", e.target.value)} placeholder="e.g. DVSA APPROVED INSTRUCTOR" />
          </div>
          <div>
            <label style={labelStyle}>Heading</label>
            <input style={inputStyle} value={banner.heading ?? ""} onChange={(e) => set("heading", e.target.value)} placeholder="Main banner heading" />
          </div>
          <div>
            <label style={labelStyle}>Sub-heading</label>
            <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }} value={banner.subheading ?? ""} onChange={(e) => set("subheading", e.target.value)} placeholder="Supporting sentence below the heading" />
          </div>

          {/* Image upload */}
          <div>
            <label style={labelStyle}>Banner background image</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed #c3c4c7", borderRadius: "8px", padding: "1rem", textAlign: "center",
                cursor: "pointer", backgroundColor: "#fafafa",
              }}
            >
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {uploading ? (
                <span style={{ fontSize: "0.85rem", color: "#50575e" }}>Compressing & uploading…</span>
              ) : banner.imageUrl ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={banner.imageUrl} alt="banner" style={{ height: "48px", borderRadius: "4px", border: "1px solid #e2e4e7" }} />
                  <span style={{ fontSize: "0.8rem", color: "#2271b1" }}>Click or drop to replace</span>
                </div>
              ) : (
                <span style={{ fontSize: "0.85rem", color: "#50575e" }}>📤 Click or drag an image here (JPG / PNG / WebP)</span>
              )}
            </div>

            {uploadInfo && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.76rem", color: "#1e7e34", backgroundColor: "#edfaef", border: "1px solid #b5e0bf", borderRadius: "6px", padding: "0.45rem 0.7rem" }}>
                ✓ Compressed {fmtBytes(uploadInfo.before)} → <strong>{fmtBytes(uploadInfo.after)}</strong> ({uploadInfo.savedPct}% smaller) - high quality kept.
              </div>
            )}

            {banner.imageUrl && (
              <div style={{ marginTop: "0.75rem" }}>
                <label style={labelStyle}>Image darkening (for text legibility) - {banner.overlay ?? 55}%</label>
                <input type="range" min={0} max={90} value={banner.overlay ?? 55} onChange={(e) => set("overlay", Number(e.target.value))} style={{ width: "100%" }} />
                <button onClick={() => { set("imageUrl", undefined); setUploadInfo(null); }} style={{ marginTop: "0.4rem", background: "none", border: "none", color: "#d63638", fontSize: "0.76rem", cursor: "pointer", padding: 0 }}>
                  Remove image (use default gradient)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.25rem" }}>
        <button
          onClick={save}
          disabled={saving}
          style={{ backgroundColor: "#2271b1", color: "#fff", border: "none", padding: "0.6rem 1.5rem", borderRadius: "6px", fontWeight: 700, fontSize: "0.88rem", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span style={{ color: "#1e7e34", fontSize: "0.85rem", fontWeight: 600 }}>✓ Saved - live on the site</span>}
        {error && <span style={{ color: "#d63638", fontSize: "0.85rem" }}>{error}</span>}
      </div>
    </div>
  );
}
