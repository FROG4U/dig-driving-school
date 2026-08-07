import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

function superAdminOnly(user: Awaited<ReturnType<typeof getAdminUser>>) {
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  if (user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  const err = superAdminOnly(user);
  if (err) return err;

  const { id } = await params;
  await prisma.competitor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
