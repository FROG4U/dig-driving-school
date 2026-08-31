import type { MetadataRoute } from "next";
import { getBrandingSettings } from "@/lib/site-settings";

// Read fresh so the installed-app icon reflects the current uploaded logo icon.
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const branding = await getBrandingSettings();
  const icon = branding.iconUrl;

  const icons: MetadataRoute.Manifest["icons"] = icon
    ? [
        { src: icon, sizes: "192x192", purpose: "any" },
        { src: icon, sizes: "512x512", purpose: "any" },
        { src: icon, sizes: "512x512", purpose: "maskable" },
      ]
    : [];

  return {
    name: "DIG Driving School",
    short_name: "DIG DS",
    description: "Modern driving lessons with a DVSA-approved instructor. Manual and automatic, 7 days a week.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#070d18",
    theme_color: "#f47c20",
    icons,
  };
}
