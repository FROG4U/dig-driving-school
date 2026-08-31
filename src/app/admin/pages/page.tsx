import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { sitePages } from "@/lib/admin-pages";
import { toSlugParam } from "@/lib/slug";


export default async function PagesAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/dds");
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  // Load all saved SEO records so we can show status
  const seoRecords = await prisma.pageSeo.findMany();
  const seoMap = new Map(seoRecords.map((s) => [s.slug, s]));

  const doneCount = sitePages.filter((p) => {
    const s = seoMap.get(p.slug);
    return s?.metaTitle && s?.metaDesc;
  }).length;

  return (
    <AdminShell adminName={user.name} adminRole={user.role}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1d2327", margin: 0 }}>Pages</h1>
          <p style={{ color: "#50575e", fontSize: "0.85rem", margin: "0.3rem 0 0" }}>
            {sitePages.length} published pages - {doneCount} with SEO configured
            {isSuperAdmin && doneCount < sitePages.length && (
              <span style={{ color: "#d63638", marginLeft: "0.4rem" }}>({sitePages.length - doneCount} still need SEO)</span>
            )}
          </p>
        </div>

        {isSuperAdmin && (
          <Link
            href="/admin/seo/generate-all"
            style={{ display: "inline-block", backgroundColor: "transparent", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", padding: "0.5rem 1.2rem", borderRadius: "3px", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}
          >
            🤖 Generate All SEO
          </Link>
        )}
      </div>

      {/* SEO progress bar */}
      {isSuperAdmin && (
        <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1rem 1.25rem", marginBottom: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1d2327" }}>SEO Coverage</span>
            <span style={{ fontSize: "0.82rem", color: "#50575e" }}>{doneCount} / {sitePages.length} pages</span>
          </div>
          <div style={{ height: "8px", backgroundColor: "#e2e4e7", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round((doneCount / sitePages.length) * 100)}%`, backgroundColor: doneCount === sitePages.length ? "#1e7e34" : doneCount > 7 ? "#2271b1" : "#d63638", borderRadius: "4px", transition: "width 0.3s ease" }} />
          </div>
          {doneCount < sitePages.length && (
            <p style={{ fontSize: "0.75rem", color: "#7a5c0a", marginTop: "0.4rem" }}>
              💡 Click <strong>Edit SEO</strong> on each page then hit <strong>🤖 Generate SEO</strong> to fill it in automatically using your competitor keywords.
            </p>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
        <span style={{ fontWeight: 700, color: "#1d2327" }}>All ({sitePages.length})</span>
        <span style={{ color: "#c3c4c7", margin: "0 6px" }}>|</span>
        <span style={{ color: "#2271b1", cursor: "pointer" }}>Pages ({sitePages.filter(p => p.type === "Page").length})</span>
        <span style={{ color: "#c3c4c7", margin: "0 6px" }}>|</span>
        <span style={{ color: "#2271b1", cursor: "pointer" }}>Locations ({sitePages.filter(p => p.type === "Location").length})</span>
      </div>

      {/* Pages table */}
      <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f6f7f7", borderBottom: "1px solid #e2e4e7" }}>
              <th style={{ padding: "0.65rem 1.25rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Title</th>
              <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>URL</th>
              <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Type</th>
              {isSuperAdmin && (
                <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>SEO Status</th>
              )}
              {isSuperAdmin && (
                <th style={{ padding: "0.65rem 1.25rem 0.65rem 0", textAlign: "right", fontWeight: 600, color: "#50575e", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sitePages.map((page, i) => {
              const seo = seoMap.get(page.slug);
              const hasSeo = !!(seo?.metaTitle && seo?.metaDesc);
              const hasTitle = !!seo?.metaTitle;
              const hasDesc = !!seo?.metaDesc;
              const hasH1 = !!seo?.h1;
              const hasKw = !!seo?.focusKeyword;
              const score = [hasTitle, hasDesc, hasH1, hasKw].filter(Boolean).length;

              return (
                <tr
                  key={page.slug}
                  style={{ borderBottom: i < sitePages.length - 1 ? "1px solid #f0f0f1" : "none", verticalAlign: "top" }}
                >
                  {/* Title */}
                  <td style={{ padding: "0.85rem 1.25rem" }}>
                    {isSuperAdmin ? (
                      <Link
                        href={`/admin/seo/${toSlugParam(page.slug)}`}
                        style={{ fontWeight: 700, color: "#2271b1", fontSize: "0.92rem", textDecoration: "none", display: "block", marginBottom: "0.15rem" }}
                      >
                        {page.title}
                      </Link>
                    ) : (
                      <div style={{ fontWeight: 700, color: "#1d2327", fontSize: "0.92rem", marginBottom: "0.15rem" }}>{page.title}</div>
                    )}
                    <div style={{ fontSize: "0.78rem", color: "#8c8f94", marginBottom: "0.3rem" }}>{page.description}</div>

                    {/* SEO snippet preview */}
                    {isSuperAdmin && seo?.metaTitle && (
                      <div style={{ fontSize: "0.72rem", color: "#50575e", marginTop: "0.2rem", lineHeight: 1.3 }}>
                        <span style={{ color: "#1a0dab" }}>{seo.metaTitle}</span>
                      </div>
                    )}

                    <div style={{ fontSize: "0.75rem", marginTop: "0.3rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <a href={page.slug} target="_blank" rel="noreferrer" style={{ color: "#2271b1", textDecoration: "none" }}>View ↗</a>
                      {isSuperAdmin && (
                        <Link href={`/admin/seo/${toSlugParam(page.slug)}`} style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>Edit SEO</Link>
                      )}
                    </div>
                  </td>

                  {/* URL */}
                  <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                    <code style={{ fontSize: "0.75rem", color: "#50575e", backgroundColor: "#f6f7f7", padding: "0.15rem 0.4rem", borderRadius: "3px", border: "1px solid #e2e4e7" }}>
                      {page.slug}
                    </code>
                  </td>

                  {/* Type */}
                  <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                    <span style={{
                      backgroundColor: page.type === "Location" ? "#f0f6fc" : "#f6f7f7",
                      color: page.type === "Location" ? "#2271b1" : "#50575e",
                      padding: "0.15rem 0.55rem", borderRadius: "3px", fontSize: "0.72rem", fontWeight: 600,
                      border: `1px solid ${page.type === "Location" ? "#bdd7f0" : "#e2e4e7"}`,
                    }}>
                      {page.type}
                    </span>
                  </td>

                  {/* SEO Status */}
                  {isSuperAdmin && (
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      {hasSeo ? (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.3rem" }}>
                            <span style={{ color: "#1e7e34", fontWeight: 700, fontSize: "0.8rem" }}>✓</span>
                            <span style={{ fontSize: "0.75rem", color: "#1e7e34", fontWeight: 600 }}>SEO Set</span>
                          </div>
                          {/* Mini score dots */}
                          <div style={{ display: "flex", gap: "0.2rem" }}>
                            {[
                              { label: "Title", done: hasTitle },
                              { label: "Desc", done: hasDesc },
                              { label: "H1", done: hasH1 },
                              { label: "KW", done: hasKw },
                            ].map((item) => (
                              <span
                                key={item.label}
                                title={item.label}
                                style={{
                                  width: "18px", height: "6px", borderRadius: "3px",
                                  backgroundColor: item.done ? "#1e7e34" : "#e2e4e7",
                                  display: "inline-block",
                                }}
                              />
                            ))}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "#8c8f94", marginTop: "0.2rem" }}>{score}/4 fields</div>
                        </div>
                      ) : (
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "#d63638", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <span>⚠</span> No SEO
                          </span>
                          <Link
                            href={`/admin/seo/${toSlugParam(page.slug)}`}
                            style={{ fontSize: "0.72rem", color: "#7c3aed", textDecoration: "none", fontWeight: 600, display: "block", marginTop: "0.25rem" }}
                          >
                            → Generate now
                          </Link>
                        </div>
                      )}
                    </td>
                  )}

                  {/* Actions */}
                  {isSuperAdmin && (
                    <td style={{ padding: "0.85rem 1.25rem 0.85rem 0", textAlign: "right", verticalAlign: "middle" }}>
                      <Link
                        href={`/admin/seo/${toSlugParam(page.slug)}`}
                        style={{
                          display: "inline-block",
                          backgroundColor: hasSeo ? "#f6f7f7" : "#7c3aed",
                          color: hasSeo ? "#50575e" : "#fff",
                          border: hasSeo ? "1px solid #e2e4e7" : "none",
                          padding: "0.4rem 0.9rem",
                          borderRadius: "3px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {hasSeo ? "✏ Edit SEO" : "🤖 Add SEO"}
                      </Link>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
