import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";
import { hashPassword, passwordProblem } from "@/lib/admin-auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json({ error: "Cannot delete your own account." }, { status: 400 });
  }

  const target = await prisma.admin.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.admin.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// Super admin sets a new password for an admin (including their own account),
// for when someone has lost access to their email and cannot use the reset link.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { password } = await req.json().catch(() => ({ password: "" }));

  const problem = passwordProblem(String(password || ""));
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const target = await prisma.admin.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.admin.update({
    where: { id },
    data: { password: await hashPassword(String(password)) },
  });

  // Invalidate anything in flight for that account.
  await prisma.loginCode.deleteMany({ where: { adminId: id, usedAt: null } });
  await prisma.passwordReset.deleteMany({ where: { adminId: id, usedAt: null } });

  return NextResponse.json({ success: true, email: target.email });
}
