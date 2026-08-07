import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

function superAdminOnly(user: Awaited<ReturnType<typeof getAdminUser>>) {
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function GET() {
  const user = await getAdminUser();
  const err = superAdminOnly(user);
  if (err) return err;

  const competitors = await prisma.competitor.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(competitors);
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  const err = superAdminOnly(user);
  if (err) return err;

  const { name, url } = await req.json();
  if (!name || !url) return NextResponse.json({ error: "Name and URL required" }, { status: 400 });

  const competitor = await prisma.competitor.create({ data: { name, url } });
  return NextResponse.json(competitor);
}
