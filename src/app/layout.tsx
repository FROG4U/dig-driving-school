import type { Metadata, Viewport } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import Footer from "@/components/Footer";
import PWARegister from "@/components/PWARegister";
import { getBrandingSettings, getSearchSettings } from "@/lib/site-settings";
import { SITE } from "@/lib/site-config";

// Montserrat drives the whole site — a clean, modern, geometric sans used for
// both headings and body. JetBrains Mono is kept only for the small
// uppercase "eyebrow" labels, where a monospace reads as intentional.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#070d18",
};

export async function generateMetadata(): Promise<Metadata> {
  const [branding, search] = await Promise.all([getBrandingSettings(), getSearchSettings()]);
  return {
    metadataBase: new URL(SITE.url),
    // Google Search Console ownership check. The code is pasted into
    // Admin -> Settings, so verifying the site needs no code change.
    verification: search.googleVerification ? { google: search.googleVerification } : undefined,
    title: "Dig Driving School",
    description: "Modern driving lessons with a DVSA-approved instructor. Manual and automatic tuition, 7 days a week. Book your first lesson today.",
    // Installable web-app (PWA) so it can be added to the home screen.
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: "Dig DS", statusBarStyle: "black-translucent" },
    // Uploaded logo icon → favicon + home-screen (Apple touch) icon.
    icons: branding.iconUrl ? { icon: branding.iconUrl, apple: branding.iconUrl } : undefined,
  };
}

// Render pages fresh on each request so admin/CMS edits (banners, photos, text,
// prices) appear on the live site immediately, without needing a rebuild.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getBrandingSettings();
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${mono.variable}`}
      style={{ height: "100%" }}
    >
      <body style={{ minHeight: "100%", display: "flex", flexDirection: "column", fontFamily: "var(--font-montserrat), sans-serif", margin: 0 }}>
        <ConditionalLayout footer={<Footer />} logoUrl={branding.logoUrl || undefined}>{children}</ConditionalLayout>
        <PWARegister />
      </body>
    </html>
  );
}
