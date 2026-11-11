import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { PENDING_COOKIE, issueLoginCode, loginCodeRequired, signPendingToken } from "@/lib/admin-auth";

// Step 1 of login: check the password, then email a one-time code. No session
// cookie is issued here - that only happens once the code is verified.
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Emergency bypass for a broken mailbox - see ADMIN_LOGIN_CODE in .env.
    if (!loginCodeRequired()) {
      const token = await signToken({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role as "ADMIN" | "SUPER_ADMIN",
      });
      const res = NextResponse.json({ step: "done", role: admin.role, name: admin.name });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8,
        path: "/",
      });
      return res;
    }

    const sent = await issueLoginCode(admin);
    if (!sent) {
      // Never hand out a session just because email failed.
      return NextResponse.json(
        { error: "We could not email your login code. Check the site's email settings and try again." },
        { status: 500 }
      );
    }

    const pending = await signPendingToken(admin.id);
    const res = NextResponse.json({ step: "code", email: admin.email });
    res.cookies.set(PENDING_COOKIE, pending, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
