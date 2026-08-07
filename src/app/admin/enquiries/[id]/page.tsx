import { redirect, notFound } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import EnquiryActions from "./EnquiryActions";
import ReplyBox from "./ReplyBox";
import Link from "next/link";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    new: { bg: "#fce8e8", color: "#c0392b" },
    read: { bg: "#fef9e7", color: "#7a5c0a" },
    responded: { bg: "#e6f4ea", color: "#1e7e34" },
  };
  const s = map[status] || map.new;
  return (
    <span style={{ backgroundColor: s.bg, color: s.color, padding: "0.2rem 0.65rem", borderRadius: "3px", fontSize: "0.78rem", fontWeight: 700, textTransform: "capitalize" }}>
      {status}
    </span>
  );
}

export default async function EnquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) redirect("/dds");

  const { id } = await params;
  const enquiry = await prisma.enquiry.findUnique({ where: { id } });
  if (!enquiry) notFound();

  return (
    <AdminShell adminName={user.name} adminRole={user.role}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Link href="/admin/enquiries" style={{ color: "#2271b1", textDecoration: "none", fontSize: "0.85rem" }}>
          ← Back to Enquiries
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.25rem", maxWidth: "900px", alignItems: "start" }}>
        {/* Main detail card */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid #f0f0f1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#1d2327" }}>{enquiry.fullName}</h1>
            <StatusBadge status={enquiry.status} />
          </div>

          <div style={{ padding: "1.5rem" }}>
            {[
              ["Full Name", enquiry.fullName],
              ["Contact Number", enquiry.contactNumber],
              ["Email", enquiry.email],
              ["Location", enquiry.location],
              ["Received", new Date(enquiry.createdAt).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", marginBottom: "0.85rem", gap: "1rem" }}>
                <div style={{ width: "130px", fontSize: "0.78rem", color: "#50575e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0, paddingTop: "0.1rem" }}>{label}</div>
                <div style={{ fontSize: "0.9rem", color: "#1d2327", flex: 1 }}>{value}</div>
              </div>
            ))}

            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ fontSize: "0.78rem", color: "#50575e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>Message</div>
              <div style={{ backgroundColor: "#f6f7f7", border: "1px solid #e2e4e7", borderRadius: "4px", padding: "1rem", fontSize: "0.9rem", color: "#1d2327", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {enquiry.message}
              </div>
            </div>

            <ReplyBox id={enquiry.id} to={enquiry.email} />
          </div>
        </div>

        {/* Actions sidebar */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", padding: "1.25rem" }}>
          <h2 style={{ fontSize: "0.82rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 1rem" }}>Actions</h2>
          <EnquiryActions id={enquiry.id} currentStatus={enquiry.status} />
        </div>
      </div>
    </AdminShell>
  );
}
