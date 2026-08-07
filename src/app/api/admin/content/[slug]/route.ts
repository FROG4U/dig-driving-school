import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { getCmsPage } from "@/lib/cms-pages";
import { decodeSlug } from "@/lib/slug";

function requireAdmin(user: Awaited<ReturnType<typeof getAdminUser>>) {
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  return null;
}

// GET - return saved section data for a page, merged so the editor always has
// every known section pre-filled with its current (saved or default) values.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAdminUser();
  const err = requireAdmin(user);
  if (err) return err;

  const slug = decodeSlug((await params).slug);
  const page = getCmsPage(slug);
  if (!page) return NextResponse.json({ error: "Unknown page" }, { status: 404 });

  const rows = await prisma.pageSection.findMany({ where: { slug } });
  const saved: Record<string, { data: unknown; enabled: boolean }> = {};
  for (const r of rows) {
    try {
      saved[r.sectionKey] = { data: JSON.parse(r.data), enabled: r.enabled };
    } catch {
      saved[r.sectionKey] = { data: {}, enabled: r.enabled };
    }
  }

  // Banner: merge saved over defaults so the form is never blank.
  const banner = { ...page.banner, ...((saved.banner?.data as object) ?? {}) };

  return NextResponse.json({ slug, title: page.title, banner });
}

// PUT - upsert one section's data. Body: { sectionKey, data, enabled? }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAdminUser();
  const err = requireAdmin(user);
  if (err) return err;

  const slug = decodeSlug((await params).slug);
  const page = getCmsPage(slug);
  if (!page) return NextResponse.json({ error: "Unknown page" }, { status: 404 });

  const body = await req.json();
  const sectionKey: string = body.sectionKey;
  if (!sectionKey) return NextResponse.json({ error: "Missing sectionKey" }, { status: 400 });

  const data = JSON.stringify(body.data ?? {});
  const enabled = body.enabled !== false;

  const saved = await prisma.pageSection.upsert({
    where: { slug_sectionKey: { slug, sectionKey } },
    update: { data, enabled },
    create: { slug, sectionKey, data, enabled },
  });

  return NextResponse.json({ ok: true, slug, sectionKey, enabled: saved.enabled });
}
