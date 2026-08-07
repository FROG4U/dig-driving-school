"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface PeriodStats { views: number; visitors: number; }
interface HourlyData { hour: number; views: number; visitors: number; }
interface DailyData { date: string; views: number; visitors: number; }
interface MonthlyData { month: string; views: number; visitors: number; }
interface TopPage { slug: string; views: number; visitors: number; }
interface Referrer { source: string; views: number; }
interface DeviceStat { device: string; count: number; }

interface AnalyticsData {
  live: PeriodStats;
  today: PeriodStats;
  yesterday: PeriodStats;
  week: PeriodStats;
  month: PeriodStats;
  year: PeriodStats;
  allTime: number;
  hourlyData: HourlyData[];
  dailyData: DailyData[];
  monthlyData: MonthlyData[];
  topPages: TopPage[];
  referrers: Referrer[];
  devices: DeviceStat[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function fmtMonth(m: string) {
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

function fmtHour(h: number) {
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

function delta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? "+100%" : "-";
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

function pageName(slug: string) {
  if (slug === "/") return "Home";
  return slug.replace(/^\/locations\//, "").replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────
function BarChart({ data, labelKey, valueKey, color = "#2271b1", maxBars = 30 }: {
  data: Record<string, number | string>[];
  labelKey: string;
  valueKey: string;
  color?: string;
  maxBars?: number;
}) {
  const items = data.slice(-maxBars);
  const max = Math.max(...items.map((d) => Number(d[valueKey])), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "80px", width: "100%" }}>
      {items.map((item, i) => {
        const val = Number(item[valueKey]);
        const pct = (val / max) * 100;
        return (
          <div
            key={i}
            title={`${item[labelKey]}: ${val}`}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: "2px" }}
          >
            <div style={{ width: "100%", height: `${pct}%`, minHeight: val > 0 ? "2px" : "0", backgroundColor: color, borderRadius: "2px 2px 0 0", transition: "height 0.3s ease" }} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, delta: d, color, live }: {
  label: string; value: number | string; sub?: string; delta?: string; color: string; live?: boolean;
}) {
  const isUp = d?.startsWith("+");
  const isDown = d?.startsWith("-");
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderTop: `3px solid ${color}`, borderRadius: "3px", padding: "1rem 1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "0.75rem", color: "#50575e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
        {live && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", color: "#1e7e34", fontWeight: 700 }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#1e7e34", animation: "pulse 1.5s infinite" }} />
            LIVE
          </span>
        )}
      </div>
      <div style={{ fontSize: "1.9rem", fontWeight: 700, color, lineHeight: 1.1 }}>{value.toLocaleString()}</div>
      {sub && <div style={{ fontSize: "0.75rem", color: "#50575e", marginTop: "0.2rem" }}>{sub}</div>}
      {d && d !== "-" && (
        <div style={{ fontSize: "0.72rem", marginTop: "0.25rem", color: isUp ? "#1e7e34" : isDown ? "#d63638" : "#50575e", fontWeight: 600 }}>
          {d} vs prev period
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TrafficClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<"today" | "30days" | "12months">("30days");
  const [tableView, setTableView] = useState<"pages" | "referrers" | "devices">("pages");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        setData(await res.json());
        setLastRefresh(new Date());
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // Refresh live data every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem", color: "#50575e" }}>
      <div>Loading traffic data…</div>
    </div>
  );

  if (!data) return <div style={{ color: "#d63638", padding: "2rem" }}>Failed to load analytics.</div>;

  // Chart data
  const chartData = chartPeriod === "today"
    ? data.hourlyData.map((h) => ({ label: fmtHour(h.hour), views: h.views, visitors: h.visitors }))
    : chartPeriod === "30days"
    ? data.dailyData.map((d) => ({ label: fmtDate(d.date), views: d.views, visitors: d.visitors }))
    : data.monthlyData.map((m) => ({ label: fmtMonth(m.month), views: m.views, visitors: m.visitors }));

  const totalDevices = data.devices.reduce((a, d) => a + d.count, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1d2327", margin: 0 }}>📊 Traffic & Visitors</h1>
          <p style={{ color: "#50575e", fontSize: "0.82rem", margin: "0.3rem 0 0" }}>
            Real visitors to your website - updated every 30 seconds
            <span style={{ color: "#8c8f94", marginLeft: "0.5rem" }}>
              (last updated {lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })})
            </span>
          </p>
        </div>
        <button onClick={load} style={{ padding: "0.4rem 0.9rem", backgroundColor: "#f6f7f7", border: "1px solid #e2e4e7", borderRadius: "3px", fontSize: "0.8rem", cursor: "pointer", color: "#50575e" }}>
          🔄 Refresh
        </button>
      </div>

      {/* ── Live + summary stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Live Now" value={data.live.visitors} sub={`${data.live.views} page views`} color="#1e7e34" live />
        <StatCard label="Today" value={data.today.visitors} sub={`${data.today.views} page views`} delta={delta(data.today.views, data.yesterday.views)} color="#2271b1" />
        <StatCard label="Last 30 Days" value={data.month.visitors} sub={`${data.month.views} page views`} color="#7c3aed" />
        <StatCard label="All Time" value={data.allTime} sub="total page views" color="#7a5c0a" />
      </div>

      {/* ── Secondary stats row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard label="Yesterday" value={data.yesterday.visitors} sub={`${data.yesterday.views} views`} color="#50575e" />
        <StatCard label="Last 7 Days" value={data.week.visitors} sub={`${data.week.views} views`} color="#2271b1" />
        <StatCard label="Last 30 Days" value={data.month.views} sub="page views" color="#7c3aed" />
        <StatCard label="This Year" value={data.year.views} sub={`${data.year.visitors} unique visitors`} color="#c0392b" />
      </div>

      {/* ── Chart ───────────────────────────────────────────────── */}
      <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1d2327" }}>
              {chartPeriod === "today" ? "Today by Hour" : chartPeriod === "30days" ? "Last 30 Days" : "Last 12 Months"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#50575e", marginTop: "0.1rem" }}>
              {chartData.reduce((a, d) => a + d.views, 0)} views · {chartData.reduce((a, d) => a + d.visitors, 0)} visitors
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            {(["today", "30days", "12months"] as const).map((p) => (
              <button key={p} onClick={() => setChartPeriod(p)} style={{
                padding: "0.3rem 0.7rem", borderRadius: "3px", fontSize: "0.75rem", cursor: "pointer", fontWeight: chartPeriod === p ? 700 : 400,
                backgroundColor: chartPeriod === p ? "#2271b1" : "#f6f7f7",
                color: chartPeriod === p ? "#fff" : "#50575e",
                border: chartPeriod === p ? "none" : "1px solid #e2e4e7",
              }}>
                {p === "today" ? "Today" : p === "30days" ? "30 Days" : "12 Months"}
              </button>
            ))}
          </div>
        </div>

        {/* Chart bars */}
        <div style={{ position: "relative" }}>
          {/* Y axis labels */}
          <div style={{ marginBottom: "0.5rem" }}>
            <BarChart data={chartData} labelKey="label" valueKey="views" color="#2271b1" maxBars={chartPeriod === "today" ? 24 : chartPeriod === "30days" ? 30 : 12} />
          </div>

          {/* X axis labels - show every Nth label to avoid crowding */}
          <div style={{ display: "flex", gap: "2px" }}>
            {chartData.map((item, i) => {
              const total = chartData.length;
              const show = total <= 12 || i === 0 || i === total - 1 || i % Math.ceil(total / 8) === 0;
              return (
                <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.6rem", color: "#8c8f94", whiteSpace: "nowrap", overflow: "hidden" }}>
                  {show ? item.label : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f0f0f1" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#50575e" }}>
            <div style={{ width: "10px", height: "10px", backgroundColor: "#2271b1", borderRadius: "2px" }} /> Page Views
          </div>
          <div style={{ fontSize: "0.75rem", color: "#50575e" }}>
            Peak: <strong>{Math.max(...chartData.map((d) => d.views))}</strong> views in one {chartPeriod === "today" ? "hour" : chartPeriod === "30days" ? "day" : "month"}
          </div>
        </div>
      </div>

      {/* ── Bottom section: pages + referrers + devices ──────── */}
      <div style={{ display: "grid", gap: "1.25rem" }} className="md:grid-cols-[1fr_340px]">

        {/* Left: pages / referrers / devices table */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", boxShadow: "0 1px 1px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          {/* Tab header */}
          <div style={{ display: "flex", borderBottom: "1px solid #e2e4e7", padding: "0 1rem" }}>
            {(["pages", "referrers", "devices"] as const).map((t) => (
              <button key={t} onClick={() => setTableView(t)} style={{
                background: "none", border: "none", padding: "0.75rem 0.75rem",
                borderBottom: tableView === t ? "2px solid #2271b1" : "2px solid transparent",
                color: tableView === t ? "#2271b1" : "#50575e", fontWeight: tableView === t ? 700 : 400,
                fontSize: "0.82rem", cursor: "pointer", textTransform: "capitalize",
              }}>
                {t === "pages" ? "Top Pages" : t === "referrers" ? "Traffic Sources" : "Devices"}
              </button>
            ))}
          </div>

          {/* Top pages */}
          {tableView === "pages" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f6f7f7" }}>
                  <th style={{ padding: "0.6rem 1.25rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em" }}>Page</th>
                  <th style={{ padding: "0.6rem 0.75rem", textAlign: "right", fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em" }}>Views</th>
                  <th style={{ padding: "0.6rem 1.25rem 0.6rem 0", textAlign: "right", fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em" }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "#8c8f94", fontSize: "0.85rem" }}>No page views yet. Visit your public site to start tracking.</td></tr>
                ) : data.topPages.map((page, i) => {
                  const totalViews = data.topPages.reduce((a, p) => a + p.views, 0) || 1;
                  const pct = Math.round((page.views / totalViews) * 100);
                  return (
                    <tr key={page.slug} style={{ borderBottom: "1px solid #f0f0f1" }}>
                      <td style={{ padding: "0.7rem 1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.7rem", color: "#c3c4c7", width: "18px", flexShrink: 0 }}>{i + 1}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: "#1d2327", fontSize: "0.85rem" }}>{pageName(page.slug)}</div>
                            <div style={{ fontSize: "0.72rem", color: "#8c8f94" }}>
                              <a href={page.slug} target="_blank" rel="noreferrer" style={{ color: "#2271b1", textDecoration: "none" }}>{page.slug} ↗</a>
                            </div>
                          </div>
                        </div>
                        {/* Mini bar */}
                        <div style={{ marginTop: "0.35rem", marginLeft: "26px", height: "3px", backgroundColor: "#f0f0f1", borderRadius: "2px" }}>
                          <div style={{ height: "100%", width: `${pct}%`, backgroundColor: "#2271b1", borderRadius: "2px" }} />
                        </div>
                      </td>
                      <td style={{ padding: "0.7rem 0.75rem", textAlign: "right", fontWeight: 700, color: "#1d2327" }}>{page.views.toLocaleString()}</td>
                      <td style={{ padding: "0.7rem 1.25rem 0.7rem 0", textAlign: "right", color: "#50575e", fontSize: "0.8rem" }}>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Traffic Sources */}
          {tableView === "referrers" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f6f7f7" }}>
                  <th style={{ padding: "0.6rem 1.25rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em" }}>Source</th>
                  <th style={{ padding: "0.6rem 1.25rem 0.6rem 0", textAlign: "right", fontSize: "0.72rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.04em" }}>Views</th>
                </tr>
              </thead>
              <tbody>
                {data.referrers.length === 0 ? (
                  <tr><td colSpan={2} style={{ padding: "2rem", textAlign: "center", color: "#8c8f94", fontSize: "0.85rem" }}>No referrer data yet.</td></tr>
                ) : data.referrers.map((ref, i) => {
                  const totalRef = data.referrers.reduce((a, r) => a + r.views, 0) || 1;
                  const pct = Math.round((ref.views / totalRef) * 100);
                  const icon = ref.source.includes("google") ? "🔍" : ref.source.includes("facebook") || ref.source.includes("fb.") ? "📘" : ref.source === "Direct / None" ? "🔗" : "🌐";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f1" }}>
                      <td style={{ padding: "0.7rem 1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                          <span>{icon}</span>
                          <span style={{ fontWeight: 600, color: "#1d2327" }}>{ref.source}</span>
                        </div>
                        <div style={{ height: "3px", backgroundColor: "#f0f0f1", borderRadius: "2px" }}>
                          <div style={{ height: "100%", width: `${pct}%`, backgroundColor: "#7c3aed", borderRadius: "2px" }} />
                        </div>
                      </td>
                      <td style={{ padding: "0.7rem 1.25rem 0.7rem 0", textAlign: "right", fontWeight: 700, color: "#1d2327" }}>{ref.views.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Devices */}
          {tableView === "devices" && (
            <div style={{ padding: "1.25rem" }}>
              {data.devices.length === 0 ? (
                <p style={{ color: "#8c8f94", fontSize: "0.85rem", textAlign: "center", padding: "2rem 0" }}>No device data yet.</p>
              ) : data.devices.map((d) => {
                const pct = Math.round((d.count / totalDevices) * 100);
                const icon = d.device === "mobile" ? "📱" : d.device === "tablet" ? "📟" : "💻";
                const color = d.device === "mobile" ? "#2271b1" : d.device === "tablet" ? "#7c3aed" : "#1e7e34";
                return (
                  <div key={d.device} style={{ marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1d2327" }}>{icon} {d.device.charAt(0).toUpperCase() + d.device.slice(1)}</span>
                      <span style={{ fontSize: "0.85rem", color: "#50575e" }}>{d.count.toLocaleString()} views ({pct}%)</span>
                    </div>
                    <div style={{ height: "8px", backgroundColor: "#f0f0f1", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: quick stats sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Visitors vs Views */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>This Month at a Glance</div>
            {[
              { label: "Unique Visitors", value: data.month.visitors, color: "#2271b1" },
              { label: "Page Views", value: data.month.views, color: "#7c3aed" },
              { label: "Pages / Visitor", value: data.month.visitors > 0 ? (data.month.views / data.month.visitors).toFixed(1) : "0", color: "#1e7e34" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f1" }}>
                <span style={{ fontSize: "0.82rem", color: "#50575e" }}>{item.label}</span>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: item.color }}>{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Daily average */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #c3c4c7", borderRadius: "3px", padding: "1.25rem", boxShadow: "0 1px 1px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#50575e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>Averages</div>
            {[
              { label: "Avg views / day", value: data.dailyData.length > 0 ? Math.round(data.dailyData.reduce((a, d) => a + d.views, 0) / data.dailyData.filter(d => d.views > 0).length || 1) : 0 },
              { label: "Avg visitors / day", value: data.dailyData.length > 0 ? Math.round(data.dailyData.reduce((a, d) => a + d.visitors, 0) / data.dailyData.filter(d => d.visitors > 0).length || 1) : 0 },
              { label: "Best day (30d)", value: Math.max(...data.dailyData.map(d => d.views)) + " views" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f1" }}>
                <span style={{ fontSize: "0.82rem", color: "#50575e" }}>{item.label}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1d2327" }}>{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Info */}
          <div style={{ backgroundColor: "#f0f6fc", border: "1px solid #bdd7f0", borderLeft: "3px solid #2271b1", borderRadius: "3px", padding: "0.85rem 1rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2271b1", marginBottom: "0.3rem" }}>📡 How tracking works</div>
            <div style={{ fontSize: "0.75rem", color: "#1d2327", lineHeight: 1.5 }}>
              Every visitor to your public website is tracked automatically. <strong>Live Now</strong> shows visitors active in the last 5 minutes. Data refreshes every 30 seconds.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
