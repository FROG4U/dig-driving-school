"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

interface Admin { id: string; email: string; name: string; role: string; createdAt: string; }
interface AdminInfo { name: string; role: string; id: string; }

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.85rem",
  backgroundColor: "#fff",
  border: "1px solid #c3c4c7",
  borderRadius: "4px",
  color: "#1d2327",
  fontSize: "0.88rem",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

export default function AdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [me, setMe] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "ADMIN" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      const [adminsRes, meRes] = await Promise.all([
        fetch("/api/admin/admins"),
        fetch("/api/admin/me").catch(() => null),
      ]);
      if (!adminsRes.ok) { router.push("/admin/dashboard"); return; }
      setAdmins(await adminsRes.json());
      if (meRes?.ok) setMe(await meRes.json());
      setLoading(false);
    }
    load();
  }, [router]);

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to add admin."); return; }
    setAdmins((prev) => [...prev, data]);
    setForm({ email: "", name: "", password: "", role: "ADMIN" });
    setSuccess(`Admin "${data.name}" created successfully.`);
  }

  async function deleteAdmin(id: string, name: string) {
    if (!confirm(`Remove admin "${name}"? They will no longer be able to log in.`)) return;
    const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f0f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#50575e" }}>Loading…</div>
  );

  return (
    <AdminShell adminName={me?.name || "Admin"} adminRole={me?.role || "SUPER_ADMIN"}>
      <div style={{ maxWidth: "780px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1d2327", margin: 0 }}>Admin Users</h1>
          <p style={{ color: "#50575e", fontSize: "0.85rem", margin: "0.3rem 0 0" }}>Manage who can access this admin panel.</p>
        </div>

        {/* Current users table */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #f0f0f1", backgroundColor: "#f6f7f7" }}>
            <h2 style={{ fontWeight: 600, fontSize: "0.82rem", margin: 0, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em" }}>Current Users</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f6f7f7", borderBottom: "1px solid #e2e4e7" }}>
                <th style={{ padding: "0.6rem 1.25rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Name</th>
                <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Email</th>
                <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Role</th>
                <th style={{ padding: "0.6rem 1.25rem 0.6rem 0", textAlign: "right", fontWeight: 600, color: "#50575e", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.03em" }}></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: i < admins.length - 1 ? "1px solid #f0f0f1" : "none" }}>
                  <td style={{ padding: "0.75rem 1.25rem", fontWeight: 600, color: "#1d2327" }}>
                    {a.name}
                    {a.id === me?.id && <span style={{ fontSize: "0.72rem", color: "#8c8f94", marginLeft: "0.5rem", fontWeight: 400 }}>- you</span>}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#50575e" }}>{a.email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{
                      backgroundColor: a.role === "SUPER_ADMIN" ? "#f0f6fc" : "#f6f7f7",
                      color: a.role === "SUPER_ADMIN" ? "#2271b1" : "#50575e",
                      padding: "0.15rem 0.55rem",
                      borderRadius: "3px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      border: `1px solid ${a.role === "SUPER_ADMIN" ? "#bdd7f0" : "#e2e4e7"}`,
                    }}>
                      {a.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1.25rem 0.75rem 0", textAlign: "right" }}>
                    {a.id !== me?.id && (
                      <button
                        onClick={() => deleteAdmin(a.id, a.name)}
                        style={{ background: "none", border: "none", color: "#d63638", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, padding: 0, textDecoration: "underline" }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add new admin */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #f0f0f1", backgroundColor: "#f6f7f7" }}>
            <h2 style={{ fontWeight: 600, fontSize: "0.82rem", margin: 0, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em" }}>Add New Admin</h2>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <form onSubmit={addAdmin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1d2327", display: "block", marginBottom: "0.3rem" }}>Full Name</label>
                  <input style={inputStyle} type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="John Smith" />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1d2327", display: "block", marginBottom: "0.3rem" }}>Email Address</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="john@digds.co.uk" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1d2327", display: "block", marginBottom: "0.3rem" }}>Password</label>
                  <input style={inputStyle} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1d2327", display: "block", marginBottom: "0.3rem" }}>Role</label>
                  <select style={{ ...inputStyle, backgroundColor: "#fff" }} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>
              {error && (
                <div style={{ backgroundColor: "#fce8e8", border: "1px solid #f5c2c2", borderRadius: "4px", padding: "0.6rem 0.85rem", fontSize: "0.85rem", color: "#c0392b" }}>{error}</div>
              )}
              {success && (
                <div style={{ backgroundColor: "#e6f4ea", border: "1px solid #b8dfc0", borderRadius: "4px", padding: "0.6rem 0.85rem", fontSize: "0.85rem", color: "#1e7e34" }}>{success}</div>
              )}
              <div>
                <button type="submit" style={{ backgroundColor: "#2271b1", color: "#fff", border: "none", borderRadius: "3px", padding: "0.6rem 1.25rem", fontSize: "0.88rem", cursor: "pointer", fontWeight: 600 }}>
                  Add New Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
