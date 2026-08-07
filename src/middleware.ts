import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

export async function middleware(request: NextRequest) {
  // The login page now lives at /dds, outside the /admin tree, so every
  // /admin/* path the matcher catches is protected — no path exclusion needed.
  const token = request.cookies.get("dds_admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/dds", request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/dds", request.url));
    response.cookies.delete("dds_admin_token");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
