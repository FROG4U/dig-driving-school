"use client";

import { useState } from "react";
import type { SectionSchema, SectionField, SimpleField } from "@/lib/cms-sections";
import Icon, { iconNames } from "@/components/Icon";

interface Props {
  slug: string;
  schema: SectionSchema;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: Record<string, any>;
}

const labelStyle: React.CSSProperties = { fontSize: "0.76rem", fontWeight: 600, color: "#1d2327", display: "block", marginBottom: "0.25rem" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.5rem 0.65rem", border: "1px solid #c3c4c7", borderRadius: "6px", fontSize: "0.86rem", fontFamily: "inherit" };

export default function SectionEditor({ slug, schema, index, initialData }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<Record<string, any>>({ ...schema.defaults, ...initialData });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function setField(key: string, val: any) {
    setData((d) => ({ ...d, [key]: val }));
    setSaved(false);
  }

  function setItem(listKey: string, i: number, fieldKey: string, val: string) {
    setData((d) => {
      const items = [...(d[listKey] ?? [])];
      items[i] = { ...items[i], [fieldKey]: val };
      return { ...d, [listKey]: items };
    });
    setSaved(false);
  }

  function addItem(listKey: string, fields: SimpleField[]) {
    setData((d) => {
      const blank = Object.fromEntries(fields.map((f) => [f.key, ""]));
      return { ...d, [listKey]: [...(d[listKey] ?? []), blank] };
    });
    setSaved(false);
  }

  function removeItem(listKey: string, i: number) {
    setData((d) => ({ ...d, [listKey]: (d[listKey] ?? []).filter((_: unknown, idx: number) => idx !== i) }));
    setSaved(false);
  }

  function moveItem(listKey: string, i: number, dir: -1 | 1) {
    setData((d) => {
      const items = [...(d[listKey] ?? [])];
      const j = i + dir;
      if (j < 0 || j >= items.length) return d;
      [items[i], items[j]] = [items[j], items[i]];
      return { ...d, [listKey]: items };
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/content/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionKey: schema.key, data }),
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

  function iconPicker(value: string, onChange: (v: string) => void) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <span style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "rgba(74,122,181,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a7ab5", flexShrink: 0 }}>
          <Icon name={value || "car"} size={22} />
        </span>
        <select style={{ ...inputStyle, flex: 1 }} value={value || "car"} onChange={(e) => onChange(e.target.value)}>
          {iconNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    );
  }

  function renderSimple(f: SimpleField) {
    return (
      <div key={f.key}>
        <label style={labelStyle}>{f.label}</label>
        {f.type === "icon" ? (
          iconPicker(data[f.key] ?? "", (v) => setField(f.key, v))
        ) : f.type === "image" ? (
          <ImageField value={data[f.key] ?? ""} onChange={(v) => setField(f.key, v)} />
        ) : f.type === "textarea" ? (
          <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={data[f.key] ?? ""} onChange={(e) => setField(f.key, e.target.value)} />
        ) : (
          <input style={inputStyle} value={data[f.key] ?? ""} onChange={(e) => setField(f.key, e.target.value)} />
        )}
      </div>
    );
  }

  function renderField(f: SectionField) {
    if (f.type !== "list") return renderSimple(f);
    const items: Record<string, string>[] = data[f.key] ?? [];
    return (
      <div key={f.key}>
        <label style={labelStyle}>{f.label} ({items.length})</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {items.map((item, i) => (
            <div key={i} style={{ border: "1px solid #e2e4e7", borderRadius: "8px", padding: "0.75rem", backgroundColor: "#fafafa" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "capitalize" }}>{f.itemLabel} {i + 1}</span>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button type="button" onClick={() => moveItem(f.key, i, -1)} disabled={i === 0} style={miniBtn(i === 0)}>↑</button>
                  <button type="button" onClick={() => moveItem(f.key, i, 1)} disabled={i === items.length - 1} style={miniBtn(i === items.length - 1)}>↓</button>
                  <button type="button" onClick={() => removeItem(f.key, i)} style={{ ...miniBtn(false), color: "#d63638", borderColor: "#f0c4c4" }}>✕</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}>
                {f.fields.map((sf) => (
                  <div key={sf.key}>
                    <label style={{ ...labelStyle, fontSize: "0.7rem", color: "#646970" }}>{sf.label}</label>
                    {sf.type === "icon" ? (
                      iconPicker(item[sf.key] ?? "", (v) => setItem(f.key, i, sf.key, v))
                    ) : sf.type === "textarea" ? (
                      <textarea style={{ ...inputStyle, minHeight: "48px", resize: "vertical", fontSize: "0.82rem" }} value={item[sf.key] ?? ""} onChange={(e) => setItem(f.key, i, sf.key, e.target.value)} />
                    ) : (
                      <input style={{ ...inputStyle, fontSize: "0.82rem" }} value={item[sf.key] ?? ""} onChange={(e) => setItem(f.key, i, sf.key, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addItem(f.key, f.fields)} style={{ alignSelf: "flex-start", backgroundColor: "#f6f7f7", border: "1px dashed #8c8f94", color: "#2271b1", padding: "0.4rem 0.9rem", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
            + Add {f.itemLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "8px", overflow: "hidden", marginTop: "1rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", padding: "0.8rem 1.2rem", border: "none", borderBottom: open ? "1px solid #e2e4e7" : "none", backgroundColor: "#f6f7f7", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ fontSize: "1rem" }}>{schema.icon ?? "📄"}</span>
        <span style={{ fontWeight: 700, color: "#1d2327", fontSize: "0.92rem" }}>{schema.title}</span>
        <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#8c8f94" }}>Section {index + 2}</span>
        <span style={{ fontSize: "0.8rem", color: "#646970" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          {schema.fields.map(renderField)}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderTop: "1px solid #f0f0f1", paddingTop: "1rem" }}>
            <button type="button" onClick={save} disabled={saving} style={{ backgroundColor: "#2271b1", color: "#fff", border: "none", padding: "0.5rem 1.3rem", borderRadius: "6px", fontWeight: 700, fontSize: "0.85rem", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "Save section"}
            </button>
            {saved && <span style={{ color: "#1e7e34", fontSize: "0.83rem", fontWeight: 600 }}>✓ Saved - live on the site</span>}
            {error && <span style={{ color: "#d63638", fontSize: "0.83rem" }}>{error}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      onChange(json.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {value && (
        <img src={value} alt="Preview" style={{ width: "100%", maxHeight: "220px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.6rem", border: "1px solid #e2e4e7" }} />
      )}
      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#f6f7f7", border: "1px dashed #8c8f94", color: "#2271b1", padding: "0.45rem 1rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: uploading ? "default" : "pointer" }}>
        {uploading ? "Uploading…" : value ? "Change Photo" : "Upload Photo"}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </label>
      {value && !uploading && (
        <button type="button" onClick={() => onChange("")} style={{ marginLeft: "0.5rem", background: "none", border: "none", color: "#d63638", fontSize: "0.78rem", cursor: "pointer", padding: 0 }}>Remove</button>
      )}
      {uploadError && <div style={{ color: "#d63638", fontSize: "0.8rem", marginTop: "0.3rem" }}>{uploadError}</div>}
    </div>
  );
}

function miniBtn(disabled: boolean): React.CSSProperties {
  return {
    width: "24px", height: "24px", borderRadius: "4px", border: "1px solid #c3c4c7",
    backgroundColor: "#fff", cursor: disabled ? "default" : "pointer", fontSize: "0.7rem",
    color: disabled ? "#c3c4c7" : "#50575e", lineHeight: 1, padding: 0,
  };
}
