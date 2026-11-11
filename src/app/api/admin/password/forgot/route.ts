import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issuePasswordReset } from "@/lib/admin-auth";

// Emails a reset link. Always answers the same way, so this cannot be used to
// discover which email addresses have admin accounts.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (typeof email === "string" && email.includes("@")) {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (admin) await issuePasswordReset(admin);
    }
  } catch {
    /* fall through - the reply is deliberately identical either way */
  }
  return NextResponse.json({
    ok: true,
    message: "If that email has an admin account, a reset link is on its way.",
  });
}
