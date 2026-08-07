import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import GenerateAllClient from "./GenerateAllClient";

export default async function GenerateAllPage() {
  const user = await getAdminUser();
  if (!user) redirect("/dds");
  if (user.role !== "SUPER_ADMIN") redirect("/admin/pages");

  return (
    <AdminShell adminName={user.name} adminRole={user.role}>
      <GenerateAllClient />
    </AdminShell>
  );
}
