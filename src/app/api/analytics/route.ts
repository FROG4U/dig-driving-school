import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { slug, referrer, sessionId, device } = await req.json();
    if (!slug || !sessionId) return NextResponse.json({ ok: false });

    // Don't track admin pages or API routes
    if (slug.startsWith("/admin") || slug.startsWith("/api")) {
      return NextResponse.json({ ok: false });
    }

    await prisma.pageView.create({
      data: {
        slug: slug.slice(0, 200),
        referrer: referrer ? referrer.slice(0, 500) : null,
        sessionId: sessionId.slice(0, 64),
        device: device || "desktop",
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
