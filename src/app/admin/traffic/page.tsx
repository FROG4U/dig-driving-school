import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import TrafficClient from "./TrafficClient";

export default async function TrafficPage() {
  const user = await getAdminUser();
  if (!user) redirect("/dds");

  return (
    <AdminShell adminName={user.name} adminRole={user.role}>
      <TrafficClient />
    </AdminShell>
  );
}
