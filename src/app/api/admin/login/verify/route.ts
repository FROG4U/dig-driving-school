import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { PENDING_COOKIE, checkLoginCode, readPendingToken } from "@/lib/admin-auth";

// Step 2 of login: check the emailed code, then issue the real session.
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Enter the code from your email." }, { status: 400 });

    const pending = req.cookies.get(PENDING_COOKIE)?.value;
    const adminId = pending ? await readPendingToken(pending) : null;
    if (!adminId) {
      return NextResponse.json({ error: "That took too long. Please sign in again." }, { status: 401 });
    }

    const result = await checkLoginCode(adminId, String(code));
    if (result !== "ok") {
      const message =
        result === "expired"
          ? "That code has expired. Sign in again to get a new one."
          : result === "too-many"
            ? "Too many wrong attempts. Sign in again to get a new code."
            : "That code is not right.";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) return NextResponse.json({ error: "Account not found." }, { status: 401 });

    const token = await signToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as "ADMIN" | "SUPER_ADMIN",
    });

    const res = NextResponse.json({ success: true, role: admin.role, name: admin.name });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    res.cookies.set(PENDING_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
