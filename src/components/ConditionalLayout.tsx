"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import AnalyticsTracker from "./AnalyticsTracker";

interface Props {
  children: React.ReactNode;
  footer: React.ReactNode;
  logoUrl?: string;
}

export default function ConditionalLayout({ children, footer, logoUrl }: Props) {
  const pathname = usePathname();
  // The admin panel and the /dds login page render standalone, without the
  // public site's navbar, footer or analytics.
  const isAdmin = pathname.startsWith("/admin") || pathname === "/dds";

  if (isAdmin) return <>{children}</>;

  return (
    <div className="site-public" style={{ display: "contents" }}>
      <AnalyticsTracker />
      <Navbar logoUrl={logoUrl} />
      <main style={{ flex: 1 }}>{children}</main>
      {footer}
    </div>
  );
}
