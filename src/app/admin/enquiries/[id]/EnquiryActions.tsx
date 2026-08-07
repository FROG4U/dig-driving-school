"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const btnBase: React.CSSProperties = {
  width: "100%",
  padding: "0.55rem 1rem",
  borderRadius: "3px",
  border: "1px solid",
  fontSize: "0.85rem",
  cursor: "pointer",
  fontWeight: 600,
  textAlign: "left",
  marginBottom: "0.5rem",
};

export default function EnquiryActions({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);

  async function update(newStatus: string) {
    await fetch("/api/admin/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setStatus(newStatus);
    router.refresh();
  }

  async function del() {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    router.push("/admin/enquiries");
  }

  return (
    <div>
      {status !== "new" && (
        <button onClick={() => update("new")} style={{ ...btnBase, backgroundColor: "#fce8e8", borderColor: "#f5c2c2", color: "#c0392b" }}>
          Mark as New
        </button>
      )}
      {status !== "read" && (
        <button onClick={() => update("read")} style={{ ...btnBase, backgroundColor: "#fef9e7", borderColor: "#f5e79e", color: "#7a5c0a" }}>
          Mark as Read
        </button>
      )}
      {status !== "responded" && (
        <button onClick={() => update("responded")} style={{ ...btnBase, backgroundColor: "#e6f4ea", borderColor: "#b8dfc0", color: "#1e7e34" }}>
          Mark as Responded
        </button>
      )}
      <div style={{ borderTop: "1px solid #f0f0f1", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
        <button onClick={del} style={{ ...btnBase, backgroundColor: "#fff", borderColor: "#d63638", color: "#d63638", marginBottom: 0 }}>
          Delete Enquiry
        </button>
      </div>
    </div>
  );
}
