import { getSection } from "@/lib/content";

export interface ContactSettings {
  address: string;
  phone: string;
  email: string;
  hours: string;
  /**
   * WhatsApp "click to chat" link, shown as the floating chat button.
   * Either a wa.me link or a plain number; blank hides the button.
   */
  whatsapp: string;
}

export interface SocialSettings {
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
}

export interface BrandingSettings {
  /** Main logo shown in the navbar. Blank = use the text logo. */
  logoUrl: string;
  /** Logo icon / favicon shown in the browser tab. Blank = default favicon. */
  iconUrl: string;
}

export interface SearchSettings {
  /**
   * The content value of Google Search Console's HTML-tag verification method
   * (the long string, not the whole <meta> tag). Blank = no tag rendered.
   */
  googleVerification: string;
}

export const contactDefaults: ContactSettings = {
  // Placeholders only - the owner overwrites these in Admin → Settings.
  address: "Your area",
  phone: "",
  email: "hello@drivinginstructorgloucester.co.uk",
  hours: "Mon-Sun, 8am-7pm",
  whatsapp: "https://wa.me/message/DOEW6GCRV4ETA1",
};

export const socialDefaults: SocialSettings = {
  facebook: "",
  instagram: "",
  twitter: "",
  tiktok: "",
  youtube: "",
};

export const brandingDefaults: BrandingSettings = {
  logoUrl: "",
  iconUrl: "",
};

export const searchDefaults: SearchSettings = {
  googleVerification: "",
};

export function getContactSettings(): Promise<ContactSettings> {
  return getSection<ContactSettings>("__site__", "contact", contactDefaults);
}

export function getSocialSettings(): Promise<SocialSettings> {
  return getSection<SocialSettings>("__site__", "social", socialDefaults);
}

export function getBrandingSettings(): Promise<BrandingSettings> {
  return getSection<BrandingSettings>("__site__", "branding", brandingDefaults);
}

/**
 * Turn whatever is in the WhatsApp setting into a usable link. Accepts a full
 * wa.me/api link as-is, or a phone number in any human format ("+44 7861
 * 668669", "07861 668669") which is normalised to international digits.
 */
export function whatsappLink(value: string): string {
  const v = (value || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;

  let digits = v.replace(/[^0-9+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  // A UK number typed as 07861... needs the 0 swapping for the country code.
  if (digits.startsWith("0")) digits = "44" + digits.slice(1);
  return digits ? `https://wa.me/${digits}` : "";
}

export function getSearchSettings(): Promise<SearchSettings> {
  return getSection<SearchSettings>("__site__", "search", searchDefaults);
}
