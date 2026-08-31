"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Icon from "@/components/Icon";

interface Props {
  children: React.ReactNode;
  adminName: string;
  adminRole: string;
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "home" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "mail" },
  { href: "/admin/pages", label: "Pages", icon: "clipboard" },
  { href: "/admin/content", label: "Content", icon: "sparkle" },
  { href: "/admin/traffic", label: "Traffic", icon: "chart" },
  { href: "/admin/competitors", label: "Competitors", icon: "target", superOnly: true },
  { href: "/admin/admins", label: "Admin Users", icon: "users", superOnly: true },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default function AdminShell({ children, adminName, adminRole }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const isSuperAdmin = adminRole === "SUPER_ADMIN";

  useEffect(() => {
    fetch("/api/admin/enquiries")
      .then((r) => r.json())
      .then((data: Array<{ status: string }>) =>
        setNewCount(data.filter((e) => e.status === "new").length)
      )
      .catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/dds");
    router.refresh();
  }

  const navList = (
    <nav style={{ paddingTop: "0.5rem" }}>
      {navItems.map((item) => {
        if (item.superOnly && !isSuperAdmin) return null;
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.6rem 1rem 0.6rem 0.85rem",
              textDecoration: "none",
              backgroundColor: active ? "#2c3338" : "transparent",
              color: active ? "#72aee6" : "#a7aaad",
              fontWeight: active ? 600 : 400,
              fontSize: "0.875rem",
              borderLeft: active ? "3px solid #72aee6" : "3px solid transparent",
              gap: "0.6rem",
            }}
          >
            <span style={{ display: "inline-flex", flexShrink: 0, opacity: active ? 1 : 0.7 }}>
              <Icon name={item.icon} size={15} strokeWidth={1.9} />
            </span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.href === "/admin/enquiries" && newCount > 0 && (
              <span style={{ backgroundColor: "#d63638", color: "#fff", borderRadius: "10px", padding: "0 6px", fontSize: "0.68rem", fontWeight: 700, minWidth: "18px", textAlign: "center", lineHeight: "18px" }}>
                {newCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "1.1rem 1rem 1rem", borderBottom: "1px solid #3c434a" }}>
        <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>DIG Driving School</div>
        <div style={{ fontSize: "0.68rem", color: "#8c8f94", marginTop: "0.2rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Admin Panel</div>
      </div>

      <div style={{ flex: 1 }}>{navList}</div>

      <div style={{ padding: "0.85rem 1rem", borderTop: "1px solid #3c434a" }}>
        <div style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 600, marginBottom: "0.1rem" }}>{adminName}</div>
        <div style={{ fontSize: "0.72rem", color: "#72aee6", marginBottom: "0.5rem" }}>
          {isSuperAdmin ? "Super Admin" : "Admin"}
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{ background: "none", border: "none", color: "#8c8f94", cursor: "pointer", fontSize: "0.78rem", padding: 0, textAlign: "left" }}
        >
          {loggingOut ? "Signing out…" : "Log Out"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f0f1" }}>
      {/* Top admin bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: "32px",
        backgroundColor: "#1d2327",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }}>
        <span style={{ color: "#a7aaad", fontSize: "0.8rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Icon name="car" size={14} strokeWidth={1.8} /> DIG Driving School
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#72aee6", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", border: "1px solid rgba(114,174,230,0.35)", borderRadius: "4px", padding: "0.15rem 0.55rem" }}
          >
            <Icon name="eye" size={12} strokeWidth={2} /> View Site
          </a>
          <span style={{ color: "#a7aaad", fontSize: "0.78rem" }}>Howdy, {adminName}</span>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#8c8f94", cursor: "pointer", fontSize: "0.75rem", padding: 0 }}>
            Log Out
          </button>
        </div>
      </div>

      <div style={{ display: "flex", paddingTop: "32px" }}>
        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex"
          style={{
            position: "fixed",
            top: "32px",
            left: 0,
            bottom: 0,
            width: "200px",
            backgroundColor: "#1d2327",
            flexDirection: "column",
            overflowY: "auto",
            zIndex: 100,
          }}
        >
          {sidebarContent}
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex" }}>
            <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setSidebarOpen(false)} />
            <aside style={{ width: "200px", backgroundColor: "#1d2327", display: "flex", flexDirection: "column", position: "relative", zIndex: 1, marginTop: "32px", overflowY: "auto" }}>
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Content area */}
        <div style={{ flex: 1, minWidth: 0 }} className="md:ml-[200px]">
          {/* Mobile header */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 1rem", backgroundColor: "#1d2327" }}
            className="md:hidden"
          >
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#a7aaad", cursor: "pointer", fontSize: "1.1rem", padding: 0 }}>☰</button>
            <span style={{ color: "#a7aaad", fontWeight: 600, fontSize: "0.88rem" }}>Admin Panel</span>
          </div>

          <main style={{ padding: "1.5rem 2rem 2.5rem" }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
