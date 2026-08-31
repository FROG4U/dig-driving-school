import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { fromSlugParam } from "@/lib/slug";

function superAdminOnly(user: Awaited<ReturnType<typeof getAdminUser>>) {
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAdminUser();
  const err = superAdminOnly(user);
  if (err) return err;

  const rawSlug = (await params).slug;
  // slug is URL-encoded, e.g. "locations-gloucester" → "/locations/gloucester"
  const slug = fromSlugParam(rawSlug);

  const seo = await prisma.pageSeo.findUnique({ where: { slug } });
  return NextResponse.json(seo ?? { slug });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAdminUser();
  const err = superAdminOnly(user);
  if (err) return err;

  const rawSlug = (await params).slug;
  const slug = fromSlugParam(rawSlug);
  const body = await req.json();

  const seo = await prisma.pageSeo.upsert({
    where: { slug },
    update: {
      metaTitle: body.metaTitle ?? null,
      metaDesc: body.metaDesc ?? null,
      h1: body.h1 ?? null,
      focusKeyword: body.focusKeyword ?? null,
      keywords: body.keywords ?? null,
      notes: body.notes ?? null,
    },
    create: {
      slug,
      metaTitle: body.metaTitle ?? null,
      metaDesc: body.metaDesc ?? null,
      h1: body.h1 ?? null,
      focusKeyword: body.focusKeyword ?? null,
      keywords: body.keywords ?? null,
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json(seo);
}
