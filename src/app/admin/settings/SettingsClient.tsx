"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import type { ContactSettings, SocialSettings, BrandingSettings } from "@/lib/site-settings";

const contactFields: { key: keyof ContactSettings; label: string; type?: string }[] = [
  { key: "address", label: "Address" },
  { key: "phone", label: "Phone Number", type: "tel" },
  { key: "email", label: "Email Address", type: "email" },
  { key: "hours", label: "Opening Hours" },
];

const socialPlatforms: { key: keyof SocialSettings; label: string; icon: string; placeholder: string }[] = [
  { key: "facebook", label: "Facebook", icon: "facebook", placeholder: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram", icon: "instagram", placeholder: "https://instagram.com/yourhandle" },
  { key: "twitter", label: "Twitter / X", icon: "twitter-x", placeholder: "https://x.com/yourhandle" },
  { key: "tiktok", label: "TikTok", icon: "tiktok", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "youtube", label: "YouTube", icon: "youtube", placeholder: "https://youtube.com/@yourchannel" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

function ImageUpload({
  value,
  onChange,
  hint,
  previewBg = "#1a1a1a",
}: {
  value: string;
  onChange: (url: string) => void;
  hint: string;
  previewBg?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onChange(json.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {value && (
        <div style={{ backgroundColor: previewBg, borderRadius: "6px", padding: "0.75rem", marginBottom: "0.6rem", display: "inline-flex", border: "1px solid #e2e4e7" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" style={{ height: "44px", width: "auto", display: "block" }} />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#f6f7f7", border: "1px dashed #8c8f94", color: "#2271b1", padding: "0.45rem 1rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: uploading ? "default" : "pointer" }}>
          {uploading ? "Uploading…" : value ? "Change" : "Upload"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" hidden disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        </label>
        {value && !uploading && (
          <button type="button" onClick={() => onChange("")} style={{ background: "none", border: "none", color: "#d63638", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}>Remove</button>
        )}
      </div>
      <p style={{ fontSize: "0.75rem", color: "#8c8f94", margin: "0.4rem 0 0" }}>{hint}</p>
      {err && <p style={{ color: "#d63638", fontSize: "0.78rem", margin: "0.3rem 0 0" }}>{err}</p>}
    </div>
  );
}

interface Props {
  contact: ContactSettings;
  social: SocialSettings;
  branding: BrandingSettings;
}

export default function SettingsClient({ contact: initContact, social: initSocial, branding: initBranding }: Props) {
  const [contactData, setContactData] = useState(initContact);
  const [socialData, setSocialData] = useState(initSocial);
  const [brandingData, setBrandingData] = useState(initBranding);
  const [contactState, setContactState] = useState<SaveState>("idle");
  const [socialState, setSocialState] = useState<SaveState>("idle");
  const [brandingState, setBrandingState] = useState<SaveState>("idle");

  async function save(
    section: "contact" | "social" | "branding",
    data: ContactSettings | SocialSettings | BrandingSettings,
    setState: (s: SaveState) => void
  ) {
    setState("saving");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      });
      if (!res.ok) throw new Error();
      setState("saved");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    color: "#1d2327",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#3c434a",
    marginBottom: "0.3rem",
  };
  const cardStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    border: "1px solid #e2e4e7",
    borderRadius: "8px",
    padding: "1.5rem 1.75rem",
    marginBottom: "1.5rem",
  };

  function SaveButton({ state, label, onClick }: { state: SaveState; label: string; onClick: () => void }) {
    const bg = state === "saved" ? "#2e7d32" : state === "error" ? "#d63638" : "#2271b1";
    const text =
      state === "saving" ? "Saving…" :
      state === "saved" ? "✓ Saved" :
      state === "error" ? "Error - try again" :
      label;
    return (
      <button
        onClick={onClick}
        disabled={state === "saving"}
        style={{
          marginTop: "1.25rem",
          backgroundColor: bg,
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          padding: "0.55rem 1.25rem",
          fontWeight: 600,
          fontSize: "0.875rem",
          cursor: state === "saving" ? "default" : "pointer",
          transition: "background-color 0.2s",
          fontFamily: "inherit",
        }}
      >
        {text}
      </button>
    );
  }

  return (
    <div style={{ maxWidth: "680px" }}>
      {/* Branding */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1d2327", marginBottom: "0.3rem" }}>
          Branding
        </h2>
        <p style={{ fontSize: "0.8rem", color: "#646970", marginBottom: "1.25rem" }}>
          Upload your logo (shown in the site header) and a logo icon (the small icon in the browser tab). Leave blank to use the default text logo.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={labelStyle}>Logo (site header)</label>
            <ImageUpload
              value={brandingData.logoUrl}
              onChange={(url) => setBrandingData((p) => ({ ...p, logoUrl: url }))}
              hint="Best as a wide PNG/SVG with a transparent background (the header is dark). Shown ~44px tall."
              previewBg="#1a1a1a"
            />
          </div>
          <div>
            <label style={labelStyle}>Logo icon (browser tab / favicon)</label>
            <ImageUpload
              value={brandingData.iconUrl}
              onChange={(url) => setBrandingData((p) => ({ ...p, iconUrl: url }))}
              hint="A small square image (e.g. 512×512 PNG). Appears on the browser tab and bookmarks."
              previewBg="#f6f7f7"
            />
          </div>
        </div>
        <SaveButton
          state={brandingState}
          label="Save Branding"
          onClick={() => save("branding", brandingData, setBrandingState)}
        />
      </div>

      {/* Contact Info */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1d2327", marginBottom: "0.3rem" }}>
          Contact Information
        </h2>
        <p style={{ fontSize: "0.8rem", color: "#646970", marginBottom: "1.25rem" }}>
          Shown in the footer and contact section across the site.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          {contactFields.map(({ key, label, type }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                type={type ?? "text"}
                value={contactData[key]}
                onChange={(e) => setContactData((p) => ({ ...p, [key]: e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <SaveButton
          state={contactState}
          label="Save Contact Info"
          onClick={() => save("contact", contactData, setContactState)}
        />
      </div>

      {/* Social Media */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1d2327", marginBottom: "0.3rem" }}>
          Social Media
        </h2>
        <p style={{ fontSize: "0.8rem", color: "#646970", marginBottom: "1.25rem" }}>
          Enter a URL to show that platform&apos;s icon in the footer. Leave blank to hide it.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {socialPlatforms.map(({ key, label, icon, placeholder }) => {
            const hasUrl = !!socialData[key];
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <span
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    flexShrink: 0,
                    backgroundColor: hasUrl ? "rgba(34,113,177,0.08)" : "#f6f7f7",
                    border: `1px solid ${hasUrl ? "rgba(34,113,177,0.25)" : "#e2e4e7"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: hasUrl ? "#2271b1" : "#a7aaad",
                    transition: "all 0.2s",
                  }}
                >
                  <Icon name={icon} size={19} strokeWidth={1.75} />
                </span>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type="url"
                    placeholder={placeholder}
                    value={socialData[key]}
                    onChange={(e) => setSocialData((p) => ({ ...p, [key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <SaveButton
          state={socialState}
          label="Save Social Links"
          onClick={() => save("social", socialData, setSocialState)}
        />
      </div>
    </div>
  );
}
