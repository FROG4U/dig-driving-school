import { redirect, notFound } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import { getCmsPage } from "@/lib/cms-pages";
import { fromSlugParam } from "@/lib/slug";
import { getBanner, getSection } from "@/lib/content";
import { getPageSectionSchemas } from "@/lib/cms-sections";
import ContentEditorClient from "./ContentEditorClient";
import SectionEditor from "./SectionEditor";

export default async function ContentEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/dds");

  const slug = fromSlugParam((await params).slug);
  const page = getCmsPage(slug);
  if (!page) notFound();

  // Current banner = saved values merged over registry defaults.
  const banner = await getBanner(slug, page.banner);

  // Load each defined section's current data (saved merged over defaults).
  const schemas = getPageSectionSchemas(slug);
  const sections = await Promise.all(
    schemas.map(async (schema) => ({
      schema,
      data: await getSection(slug, schema.key, schema.defaults),
    }))
  );

  return (
    <AdminShell adminName={user.name} adminRole={user.role}>
      <ContentEditorClient slug={slug} title={page.title} initialBanner={banner} />
      {sections.map(({ schema, data }, i) => (
        <SectionEditor key={schema.key} slug={slug} schema={schema} index={i} initialData={data} />
      ))}
      {sections.length === 0 && (
        <p style={{ marginTop: "1.25rem", fontSize: "0.78rem", color: "#8c8f94" }}>
          Only the banner is editable on this page so far. More sections are being rolled out.
        </p>
      )}
    </AdminShell>
  );
}
