import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

function startOf(unit: "day" | "week" | "month" | "year", offset = 0): Date {
  const d = new Date();
  if (unit === "day") {
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - offset);
  } else if (unit === "week") {
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 6 - offset * 7);
  } else if (unit === "month") {
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 29 - offset * 30);
  } else if (unit === "year") {
    d.setHours(0, 0, 0, 0);
    d.setFullYear(d.getFullYear() - offset);
    d.setMonth(0, 1);
  }
  return d;
}

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const todayStart = startOf("day");
  const yesterdayStart = startOf("day", 1);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yearStart = startOf("year");

  // Fetch everything in parallel
  const [
    liveViews,
    todayViews,
    yesterdayViews,
    weekViews,
    monthViews,
    yearViews,
    allViews,
    last30Days,
    topPages,
    referrers,
    deviceBreakdown,
  ] = await Promise.all([
    // Live (last 5 min)
    prisma.pageView.findMany({ where: { createdAt: { gte: fiveMinAgo } } }),
    // Today
    prisma.pageView.findMany({ where: { createdAt: { gte: todayStart } } }),
    // Yesterday
    prisma.pageView.findMany({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    // Last 7 days
    prisma.pageView.findMany({ where: { createdAt: { gte: weekStart } } }),
    // Last 30 days
    prisma.pageView.findMany({ where: { createdAt: { gte: monthStart } } }),
    // This year
    prisma.pageView.findMany({ where: { createdAt: { gte: yearStart } } }),
    // All time count
    prisma.pageView.count(),
    // Last 30 days raw for chart
    prisma.pageView.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true, sessionId: true },
      orderBy: { createdAt: "asc" },
    }),
    // Top pages (all time)
    prisma.pageView.groupBy({
      by: ["slug"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
    // Referrers
    prisma.pageView.groupBy({
      by: ["referrer"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    // Device breakdown
    prisma.pageView.groupBy({
      by: ["device"],
      _count: { id: true },
    }),
  ]);

  // ── Unique session counts ────────────────────────────────
  const uniqueSessions = (views: { sessionId: string }[]) =>
    new Set(views.map((v) => v.sessionId)).size;

  // ── Hourly chart for today (0-23) ────────────────────────
  const hourlyData = Array.from({ length: 24 }, (_, h) => {
    const count = todayViews.filter((v) => new Date(v.createdAt).getHours() === h).length;
    const sessions = new Set(
      todayViews.filter((v) => new Date(v.createdAt).getHours() === h).map((v) => v.sessionId)
    ).size;
    return { hour: h, views: count, visitors: sessions };
  });

  // ── Daily chart for last 30 days ─────────────────────────
  const dailyData: { date: string; views: number; visitors: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayViews = last30Days.filter((v) => v.createdAt.toISOString().slice(0, 10) === dateStr);
    dailyData.push({
      date: dateStr,
      views: dayViews.length,
      visitors: new Set(dayViews.map((v) => v.sessionId)).size,
    });
  }

  // ── Monthly chart for last 12 months ─────────────────────
  const monthlyViews = await prisma.pageView.findMany({
    where: { createdAt: { gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) } },
    select: { createdAt: true, sessionId: true },
  });
  const monthlyData: { month: string; views: number; visitors: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const monthStr = `${yr}-${String(mo + 1).padStart(2, "0")}`;
    const mViews = monthlyViews.filter((v) => {
      const vd = new Date(v.createdAt);
      return vd.getFullYear() === yr && vd.getMonth() === mo;
    });
    monthlyData.push({
      month: monthStr,
      views: mViews.length,
      visitors: new Set(mViews.map((v) => v.sessionId)).size,
    });
  }

  // ── Top pages with unique sessions ──────────────────────
  const topPagesWithSessions = topPages.map((p) => {
    const sessions = new Set(
      weekViews.filter((v) => v.slug === p.slug).map((v) => v.sessionId)
    ).size;
    return { slug: p.slug, views: p._count.id, visitors: sessions };
  });

  // ── Referrer cleanup ─────────────────────────────────────
  const cleanReferrers = referrers
    .filter((r) => r.referrer)
    .map((r) => {
      let label = r.referrer ?? "Direct";
      try {
        const url = new URL(r.referrer ?? "");
        label = url.hostname.replace("www.", "");
      } catch { /* keep raw */ }
      return { source: label, views: r._count.id };
    });

  // Add "Direct / none"
  const directCount = referrers.find((r) => !r.referrer)?._count.id ?? 0;
  if (directCount > 0) cleanReferrers.unshift({ source: "Direct / None", views: directCount });

  return NextResponse.json({
    live: { views: liveViews.length, visitors: uniqueSessions(liveViews) },
    today: { views: todayViews.length, visitors: uniqueSessions(todayViews) },
    yesterday: { views: yesterdayViews.length, visitors: uniqueSessions(yesterdayViews) },
    week: { views: weekViews.length, visitors: uniqueSessions(weekViews) },
    month: { views: monthViews.length, visitors: uniqueSessions(monthViews) },
    year: { views: yearViews.length, visitors: uniqueSessions(yearViews) },
    allTime: allViews,
    hourlyData,
    dailyData,
    monthlyData,
    topPages: topPagesWithSessions,
    referrers: cleanReferrers.slice(0, 10),
    devices: deviceBreakdown.map((d) => ({ device: d.device ?? "unknown", count: d._count.id })),
  });
}
