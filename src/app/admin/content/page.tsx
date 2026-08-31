import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { cmsPages } from "@/lib/cms-pages";
import { toSlugParam } from "@/lib/slug";

export default async function ContentAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/dds");

  const sections = await prisma.pageSection.findMany();
  const bySlug = new Map<string, Set<string>>();
  for (const s of sections) {
    if (!bySlug.has(s.slug)) bySlug.set(s.slug, new Set());
    bySlug.get(s.slug)!.add(s.sectionKey);
  }

  const editedCount = cmsPages.filter((p) => bySlug.has(p.slug)).length;

  return (
    <AdminShell adminName={user.name} adminRole={user.role}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1d2327", margin: 0 }}>Page Content</h1>
        <p style={{ color: "#50575e", fontSize: "0.85rem", margin: "0.3rem 0 0" }}>
          Edit each page section by section. Upload banner images - they&apos;re automatically compressed to keep your
          site fast while staying sharp. {editedCount} of {cmsPages.length} pages customised.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.9rem" }}>
        {cmsPages.map((p) => {
          const edited = bySlug.get(p.slug);
          return (
            <Link
              key={p.slug}
              href={`/admin/content/${toSlugParam(p.slug)}`}
              style={{
                display: "block",
                backgroundColor: "#fff",
                border: "1px solid #c3c4c7",
                borderRadius: "6px",
                padding: "1.1rem 1.2rem",
                textDecoration: "none",
                boxShadow: "0 1px 1px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                <span style={{ fontWeight: 700, color: "#2271b1", fontSize: "0.95rem" }}>{p.title}</span>
                <span style={{
                  backgroundColor: p.type === "Location" ? "#f0f6fc" : "#f6f7f7",
                  color: p.type === "Location" ? "#2271b1" : "#50575e",
                  padding: "0.1rem 0.5rem", borderRadius: "3px", fontSize: "0.68rem", fontWeight: 600,
                  border: `1px solid ${p.type === "Location" ? "#bdd7f0" : "#e2e4e7"}`, whiteSpace: "nowrap",
                }}>{p.type}</span>
              </div>
              <code style={{ fontSize: "0.72rem", color: "#8c8f94", display: "block", marginTop: "0.35rem" }}>{p.slug}</code>
              <div style={{ marginTop: "0.7rem", fontSize: "0.74rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                {edited ? (
                  <>
                    <span style={{ color: "#1e7e34", fontWeight: 700 }}>✓</span>
                    <span style={{ color: "#1e7e34", fontWeight: 600 }}>Customised</span>
                  </>
                ) : (
                  <span style={{ color: "#8c8f94" }}>Using defaults</span>
                )}
                <span style={{ marginLeft: "auto", color: "#7c3aed", fontWeight: 600 }}>Edit →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </AdminShell>
  );
}
