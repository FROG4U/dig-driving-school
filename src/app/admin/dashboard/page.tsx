import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    new: { bg: "#fce8e8", color: "#c0392b" },
    read: { bg: "#fef9e7", color: "#7a5c0a" },
    responded: { bg: "#e6f4ea", color: "#1e7e34" },
  };
  const s = map[status] || map.new;
  return (
    <span style={{ backgroundColor: s.bg, color: s.color, padding: "0.15rem 0.55rem", borderRadius: "3px", fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>
      {status}
    </span>
  );
}

export default async function Dashboard() {
  const user = await getAdminUser();
  if (!user) redirect("/dds");

  const [total, newCount, readCount, respondedCount, recent] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "new" } }),
    prisma.enquiry.count({ where: { status: "read" } }),
    prisma.enquiry.count({ where: { status: "responded" } }),
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const statCards = [
    { label: "Total Enquiries", value: total, color: "#4a7ab5" },
    { label: "New", value: newCount, color: "#d63638" },
    { label: "Read", value: readCount, color: "#dba617" },
    { label: "Responded", value: respondedCount, color: "#00a32a" },
  ];

  return (
    <AdminShell adminName={user.name} adminRole={user.role}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1d2327", margin: 0 }}>Dashboard</h1>
        <p style={{ color: "#50575e", fontSize: "0.85rem", margin: "0.3rem 0 0" }}>Welcome back, {user.name}.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem 1.5rem", borderTop: `3px solid ${s.color}`, boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "2.2rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.82rem", color: "#50575e", marginTop: "0.4rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent enquiries */}
      <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid #f0f0f1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontWeight: 600, fontSize: "0.95rem", margin: 0, color: "#1d2327" }}>Recent Enquiries</h2>
          <Link href="/admin/enquiries" style={{ fontSize: "0.82rem", color: "#2271b1", textDecoration: "none" }}>View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", color: "#8c8f94", fontSize: "0.88rem" }}>No enquiries yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f6f7f7", borderBottom: "1px solid #e2e4e7" }}>
                <th style={{ padding: "0.6rem 1.25rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Name</th>
                <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Location</th>
                <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Date</th>
                <th style={{ padding: "0.6rem 1.25rem 0.6rem 0", textAlign: "right", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: i < recent.length - 1 ? "1px solid #f0f0f1" : "none" }}>
                  <td style={{ padding: "0.75rem 1.25rem" }}>
                    <Link href={`/admin/enquiries/${e.id}`} style={{ fontWeight: 600, color: "#2271b1", textDecoration: "none" }}>{e.fullName}</Link>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#50575e" }}>{e.location}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#50575e" }}>{new Date(e.createdAt).toLocaleDateString("en-GB")}</td>
                  <td style={{ padding: "0.75rem 1.25rem 0.75rem 0", textAlign: "right" }}>
                    <StatusBadge status={e.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
