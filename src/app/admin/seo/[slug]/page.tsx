import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import SeoEditorClient from "./SeoEditorClient";
import { decodeSlug } from "@/lib/slug";
import { sitePages } from "@/lib/admin-pages";


export default async function SeoEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/dds");
  if (user.role !== "SUPER_ADMIN") redirect("/admin/dashboard");

  const rawSlug = (await params).slug;
  const decoded = decodeSlug(rawSlug);
  const pageInfo = sitePages.find((p) => p.slug === decoded) ?? { title: decoded, slug: decoded, type: "Page" };

  return (
    <AdminShell adminName={user.name} adminRole={user.role}>
      <SeoEditorClient slug={decoded} pageTitle={pageInfo.title} pageType={pageInfo.type} />
    </AdminShell>
  );
}
