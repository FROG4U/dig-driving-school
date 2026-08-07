import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import SettingsClient from "./SettingsClient";
import { getContactSettings, getSocialSettings, getBrandingSettings } from "@/lib/site-settings";

export default async function SettingsPage() {
  const user = await getAdminUser();
  if (!user) redirect("/dds");

  const [contact, social, branding] = await Promise.all([
    getContactSettings(),
    getSocialSettings(),
    getBrandingSettings(),
  ]);

  return (
    <AdminShell adminName={user.name} adminRole={user.role}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1d2327", marginBottom: "0.25rem" }}>
          Site Settings
        </h1>
        <p style={{ color: "#646970", fontSize: "0.85rem" }}>
          Manage contact information, opening hours and social media links shown across the site.
        </p>
      </div>
      <SettingsClient contact={contact} social={social} branding={branding} />
    </AdminShell>
  );
}
