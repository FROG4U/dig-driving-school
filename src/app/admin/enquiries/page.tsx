"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";

interface Enquiry {
  id: string;
  fullName: string;
  contactNumber: string;
  email: string;
  location: string;
  message: string;
  status: string;
  createdAt: string;
}

interface AdminInfo { name: string; role: string; }

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

export default function EnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [enqRes, meRes] = await Promise.all([
        fetch("/api/admin/enquiries"),
        fetch("/api/admin/me").catch(() => null),
      ]);
      if (!enqRes.ok) { router.push("/dds"); return; }
      setEnquiries(await enqRes.json());
      if (meRes?.ok) setAdmin(await meRes.json());
      setLoading(false);
    }
    load();
  }, [router]);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }

  async function deleteEnquiry(id: string) {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
  }

  const counts = {
    all: enquiries.length,
    new: enquiries.filter((e) => e.status === "new").length,
    read: enquiries.filter((e) => e.status === "read").length,
    responded: enquiries.filter((e) => e.status === "responded").length,
  };

  const filtered = filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f0f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#50575e" }}>
      Loading…
    </div>
  );

  return (
    <AdminShell adminName={admin?.name || "Admin"} adminRole={admin?.role || "ADMIN"}>
      {/* Page header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1d2327", margin: 0 }}>Enquiries</h1>
      </div>

      {/* WordPress-style filter tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1rem", flexWrap: "wrap" }}>
        {(["all", "new", "read", "responded"] as const).map((f, i, arr) => (
          <span key={f} style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => setFilter(f)}
              style={{
                background: "none",
                border: "none",
                padding: "0 4px",
                cursor: "pointer",
                fontSize: "0.85rem",
                color: filter === f ? "#1d2327" : "#2271b1",
                fontWeight: filter === f ? 700 : 400,
                textDecoration: filter === f ? "none" : "underline",
                textDecorationColor: "#2271b1",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
            {i < arr.length - 1 && <span style={{ color: "#c3c4c7", margin: "0 2px" }}>|</span>}
          </span>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#8c8f94", fontSize: "0.88rem" }}>No enquiries found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f6f7f7", borderBottom: "1px solid #e2e4e7" }}>
                <th style={{ padding: "0.65rem 1.25rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Name</th>
                <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Location</th>
                <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>Contact</th>
                <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Date</th>
                <th style={{ padding: "0.65rem 1.25rem 0.65rem 0", textAlign: "right", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f0f0f1" : "none", verticalAlign: "top" }}>
                  <td style={{ padding: "0.75rem 1.25rem" }}>
                    <div>
                      <Link href={`/admin/enquiries/${e.id}`} style={{ fontWeight: 600, color: "#1d2327", textDecoration: "none", fontSize: "0.9rem" }}>
                        {e.fullName}
                      </Link>
                    </div>
                    {e.message.length > 0 && (
                      <div style={{ fontSize: "0.78rem", color: "#8c8f94", marginTop: "0.15rem", maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {e.message}
                      </div>
                    )}
                    {/* Row actions */}
                    <div style={{ display: "flex", gap: "0", marginTop: "0.3rem", flexWrap: "wrap" }}>
                      {[
                        { label: "View", href: `/admin/enquiries/${e.id}` },
                      ].map((action) => (
                        <span key={action.label} style={{ display: "flex", alignItems: "center" }}>
                          <Link href={action.href} style={{ fontSize: "0.75rem", color: "#2271b1", textDecoration: "none" }}>{action.label}</Link>
                        </span>
                      ))}
                      {e.status !== "read" && (
                        <>
                          <span style={{ color: "#c3c4c7", margin: "0 4px", fontSize: "0.75rem" }}>|</span>
                          <button onClick={() => updateStatus(e.id, "read")} style={{ background: "none", border: "none", padding: 0, fontSize: "0.75rem", color: "#2271b1", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#2271b1" }}>
                            Mark Read
                          </button>
                        </>
                      )}
                      {e.status !== "responded" && (
                        <>
                          <span style={{ color: "#c3c4c7", margin: "0 4px", fontSize: "0.75rem" }}>|</span>
                          <button onClick={() => updateStatus(e.id, "responded")} style={{ background: "none", border: "none", padding: 0, fontSize: "0.75rem", color: "#2271b1", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#2271b1" }}>
                            Mark Responded
                          </button>
                        </>
                      )}
                      <span style={{ color: "#c3c4c7", margin: "0 4px", fontSize: "0.75rem" }}>|</span>
                      <button onClick={() => deleteEnquiry(e.id)} style={{ background: "none", border: "none", padding: 0, fontSize: "0.75rem", color: "#d63638", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#d63638" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#50575e", verticalAlign: "top" }}>{e.location}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#50575e", verticalAlign: "top", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "0.85rem" }}>{e.contactNumber}</div>
                    <div style={{ fontSize: "0.78rem", color: "#8c8f94" }}>{e.email}</div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#50575e", verticalAlign: "top", whiteSpace: "nowrap", fontSize: "0.85rem" }}>
                    {new Date(e.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td style={{ padding: "0.75rem 1.25rem 0.75rem 0", textAlign: "right", verticalAlign: "top" }}>
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
