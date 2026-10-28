import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { fromSlugParam } from "@/lib/slug";
import { generateSeoForSlug } from "@/lib/seo-generate";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const slug = fromSlugParam((await params).slug);

  try {
    const result = await generateSeoForSlug(slug);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generate failed";
    return NextResponse.json({ error: message }, { status: message === "Page not configured" ? 400 : 500 });
  }
}
