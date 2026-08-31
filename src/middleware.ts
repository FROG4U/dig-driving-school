import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SITE } from "@/lib/site-config";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

/** The single host we want indexed, taken from SITE.url. */
const CANONICAL_HOST = new URL(SITE.url).host;
const BARE_HOST = CANONICAL_HOST.replace(/^www\./, "");

export async function middleware(request: NextRequest) {
  // Send the bare domain to the canonical www host, so the site has exactly one
  // address in Google's index and old links keep working. 308 rather than 301
  // so a form POST keeps its method. Localhost and previews are left alone.
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  if (CANONICAL_HOST !== BARE_HOST && host === BARE_HOST) {
    const target = request.nextUrl.clone();
    target.protocol = "https:";
    target.host = CANONICAL_HOST;
    target.port = "";
    return NextResponse.redirect(target, 308);
  }

  // Everything below is the admin guard, which only applies inside /admin.
  if (!request.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

  // The login page lives at /dds, outside the /admin tree, so every /admin/*
  // path reaching this point is protected - no path exclusion needed.
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
  // Every request except Next's own static output, so the canonical-host
  // redirect can run site-wide (the admin guard still self-limits to /admin).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|banners|uploads).*)"],
};
