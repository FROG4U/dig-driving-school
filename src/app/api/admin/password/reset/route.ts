import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumePasswordReset, hashPassword, passwordProblem } from "@/lib/admin-auth";

// Completes a reset from the emailed link.
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Missing details." }, { status: 400 });
    }

    const problem = passwordProblem(password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    const adminId = await consumePasswordReset(String(token));
    if (!adminId) {
      return NextResponse.json(
        { error: "That link has expired or has already been used. Request a new one." },
        { status: 400 }
      );
    }

    await prisma.admin.update({
      where: { id: adminId },
      data: { password: await hashPassword(String(password)) },
    });

    // Any half-finished login for this account is no longer valid.
    await prisma.loginCode.deleteMany({ where: { adminId, usedAt: null } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
