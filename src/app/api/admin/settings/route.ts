import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { section, data } = (await req.json()) as {
    section: string;
    data: Record<string, string>;
  };

  if (!["contact", "social", "branding", "search"].includes(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  await prisma.pageSection.upsert({
    where: { slug_sectionKey: { slug: "__site__", sectionKey: section } },
    create: { slug: "__site__", sectionKey: section, data: JSON.stringify(data) },
    update: { data: JSON.stringify(data) },
  });

  return NextResponse.json({ ok: true });
}
