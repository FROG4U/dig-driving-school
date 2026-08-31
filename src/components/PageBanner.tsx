import { getBanner, bannerBg, type BannerData } from "@/lib/content";

const DEFAULT_BG = "linear-gradient(160deg, #0d1728 0%, #070d18 60%)";

/**
 * Standard page hero - left-aligned, grid backdrop, content-managed via the
 * "banner" section. Used by pages (e.g. the client-rendered contact/enquiry
 * forms) that render their banner from a server layout rather than inline.
 */
export default async function PageBanner({
  slug,
  fallback,
}: {
  slug: string;
  fallback: BannerData;
}) {
  const banner = await getBanner(slug, fallback);

  return (
    <section
      className={banner.imageUrl ? "" : "grid-bg"}
      style={{
        backgroundImage: bannerBg(banner, DEFAULT_BG),
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#eef2f9",
        borderBottom: "1px solid #1c2b45",
        position: "relative",
      }}
    >
      <div
        className="max-w-[1240px] mx-auto px-5"
        style={{ padding: "clamp(3.5rem, 9vw, 6.5rem) 1.25rem clamp(3rem, 7vw, 5rem)" }}
      >
        {banner.eyebrow && (
          <p className="eyebrow" style={{ marginBottom: "1.25rem" }}>{banner.eyebrow}</p>
        )}
        <h1 style={{ fontSize: "clamp(2.4rem, 7vw, 4.75rem)", maxWidth: "16ch" }}>
          {banner.heading}
        </h1>
        {banner.subheading && (
          <p style={{ color: "#94a5c0", maxWidth: "56ch", marginTop: "1.5rem", fontSize: "1.02rem", lineHeight: 1.65 }}>
            {banner.subheading}
          </p>
        )}
      </div>
    </section>
  );
}
