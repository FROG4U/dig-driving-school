"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import AnalyticsTracker from "./AnalyticsTracker";
import WhatsAppButton from "./WhatsAppButton";

interface Props {
  children: React.ReactNode;
  footer: React.ReactNode;
  logoUrl?: string;
  whatsappHref?: string;
}

export default function ConditionalLayout({ children, footer, logoUrl, whatsappHref }: Props) {
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
      {whatsappHref && <WhatsAppButton href={whatsappHref} />}
    </div>
  );
}
