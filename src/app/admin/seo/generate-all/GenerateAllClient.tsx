"use client";

import { useState } from "react";
import Link from "next/link";
import { sitePages as ALL_PAGES } from "@/lib/admin-pages";
import { toSlugParam } from "@/lib/slug";


type PageStatus = "idle" | "running" | "done" | "error";

interface PageResult {
  slug: string;
  status: PageStatus;
  metaTitle?: string;
  error?: string;
}

export default function GenerateAllClient() {
  const [results, setResults] = useState<Record<string, PageResult>>(
    Object.fromEntries(ALL_PAGES.map((p) => [p.slug, { slug: p.slug, status: "idle" }]))
  );
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  async function generateAll() {
    setRunning(true);
    setDone(false);

    for (const page of ALL_PAGES) {
      setResults((prev) => ({ ...prev, [page.slug]: { slug: page.slug, status: "running" } }));

      try {
        const res = await fetch(`/api/admin/seo/${toSlugParam(page.slug)}/generate`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setResults((prev) => ({ ...prev, [page.slug]: { slug: page.slug, status: "done", metaTitle: data.metaTitle } }));
        } else {
          // An error page from the proxy is HTML, not JSON - reading it as JSON
          // used to throw and get reported as a misleading "Network error".
          let msg = `Failed (HTTP ${res.status})`;
          try {
            const d = await res.json();
            if (d?.error) msg = d.error;
          } catch {
            /* non-JSON body - keep the status code, it is the useful part */
          }
          setResults((prev) => ({ ...prev, [page.slug]: { slug: page.slug, status: "error", error: msg } }));
        }
      } catch {
        setResults((prev) => ({ ...prev, [page.slug]: { slug: page.slug, status: "error", error: "Network error" } }));
      }

      // Small delay between requests
      await new Promise((r) => setTimeout(r, 300));
    }

    setRunning(false);
    setDone(true);
  }

  const doneCount = Object.values(results).filter((r) => r.status === "done").length;
  const errorCount = Object.values(results).filter((r) => r.status === "error").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <Link href="/admin/pages" style={{ color: "#2271b1", fontSize: "0.82rem", textDecoration: "none" }}>← Pages</Link>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1d2327", margin: 0 }}>🤖 Generate SEO for All Pages</h1>
          <p style={{ color: "#50575e", fontSize: "0.85rem", margin: "0.3rem 0 0" }}>
            Automatically generates optimised meta titles, descriptions, H1 headings and keywords for all {ALL_PAGES.length} pages using your competitor keyword data.
          </p>
        </div>

        <button
          onClick={generateAll}
          disabled={running}
          style={{
            padding: "0.6rem 1.5rem",
            background: running ? "#f6f7f7" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
            color: running ? "#8c8f94" : "#fff",
            border: running ? "1px solid #e2e4e7" : "none",
            borderRadius: "3px", fontWeight: 700, fontSize: "0.95rem",
            cursor: running ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {running ? `⏳ Generating… (${doneCount}/${ALL_PAGES.length})` : done ? "🔄 Re-generate All" : "🤖 Generate All SEO"}
        </button>
      </div>

      {/* Info banner */}
      {!running && !done && (
        <div style={{ backgroundColor: "#f0f6fc", border: "1px solid #bdd7f0", borderLeft: "3px solid #2271b1", borderRadius: "3px", padding: "0.85rem 1rem", marginBottom: "1.25rem", fontSize: "0.85rem", color: "#1d2327" }}>
          <strong>What this does:</strong> Clicks through all 14 pages and auto-generates SEO for each one using keywords from your competitor scans. Each page gets a unique, optimised meta title, description, H1 and keyword list tailored to that specific page.
        </div>
      )}

      {/* Progress summary */}
      {(running || done) && (
        <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1rem 1.25rem", marginBottom: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1d2327" }}>
              {done ? "✅ All done!" : `Processing ${doneCount + 1} of ${ALL_PAGES.length}…`}
            </span>
            <span style={{ fontSize: "0.82rem", color: "#50575e" }}>
              {doneCount} done {errorCount > 0 && <span style={{ color: "#d63638" }}>· {errorCount} errors</span>}
            </span>
          </div>
          <div style={{ height: "8px", backgroundColor: "#e2e4e7", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.round((doneCount / ALL_PAGES.length) * 100)}%`,
              backgroundColor: done ? "#1e7e34" : "#7c3aed",
              borderRadius: "4px",
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      )}

      {/* Done message */}
      {done && (
        <div style={{ backgroundColor: "#e6f4ea", border: "1px solid #b8dfc0", borderLeft: "3px solid #1e7e34", borderRadius: "3px", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
          <div style={{ fontWeight: 700, color: "#1e7e34", marginBottom: "0.3rem" }}>✓ SEO generated for all {doneCount} pages</div>
          <div style={{ fontSize: "0.85rem", color: "#1d2327" }}>
            All pages now have optimised meta titles, descriptions, H1 headings and keywords. These are <strong>live on your website</strong> right now - Google will pick them up on its next crawl.
            You can fine-tune individual pages by clicking <Link href="/admin/pages" style={{ color: "#1e7e34", fontWeight: 700 }}>Back to Pages</Link> and clicking Edit SEO on any page.
          </div>
        </div>
      )}

      {/* Page results list */}
      <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {ALL_PAGES.map((page, i) => {
          const result = results[page.slug];
          const isRunning = result.status === "running";
          const isDone = result.status === "done";
          const isError = result.status === "error";

          return (
            <div
              key={page.slug}
              style={{
                display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1.25rem",
                borderBottom: i < ALL_PAGES.length - 1 ? "1px solid #f0f0f1" : "none",
                backgroundColor: isRunning ? "#fef9e7" : isDone ? "#f8fff9" : "transparent",
                transition: "background-color 0.3s",
              }}
            >
              {/* Status icon */}
              <div style={{ width: "24px", flexShrink: 0, textAlign: "center" }}>
                {isRunning && <span style={{ fontSize: "0.9rem" }}>⏳</span>}
                {isDone && <span style={{ fontSize: "0.9rem", color: "#1e7e34" }}>✓</span>}
                {isError && <span style={{ fontSize: "0.9rem", color: "#d63638" }}>✗</span>}
                {result.status === "idle" && <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#e2e4e7", display: "inline-block" }} />}
              </div>

              {/* Page info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontWeight: 600, color: "#1d2327", fontSize: "0.9rem" }}>{page.title}</span>
                  <code style={{ fontSize: "0.72rem", color: "#8c8f94", backgroundColor: "#f6f7f7", padding: "0.05rem 0.35rem", borderRadius: "3px", border: "1px solid #e2e4e7" }}>{page.slug}</code>
                </div>
                {isDone && result.metaTitle && (
                  <div style={{ fontSize: "0.78rem", color: "#1a0dab", marginTop: "0.15rem", fontStyle: "italic" }}>{result.metaTitle}</div>
                )}
                {isError && (
                  <div style={{ fontSize: "0.75rem", color: "#d63638", marginTop: "0.1rem" }}>{result.error}</div>
                )}
                {isRunning && (
                  <div style={{ fontSize: "0.75rem", color: "#7a5c0a", marginTop: "0.1rem" }}>Generating SEO…</div>
                )}
              </div>

              {/* Edit link */}
              {isDone && (
                <Link
                  href={`/admin/seo/${toSlugParam(page.slug)}`}
                  style={{ fontSize: "0.75rem", color: "#2271b1", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  Edit →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
