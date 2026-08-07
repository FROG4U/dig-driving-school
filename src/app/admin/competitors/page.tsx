import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import CompetitorsClient from "./CompetitorsClient";

export default async function CompetitorsPage() {
  const user = await getAdminUser();
  if (!user) redirect("/dds");
  if (user.role !== "SUPER_ADMIN") redirect("/admin/dashboard");

  return (
    <AdminShell adminName={user.name} adminRole={user.role}>
      <CompetitorsClient />
    </AdminShell>
  );
}
