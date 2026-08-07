import { getSection } from "@/lib/content";

export interface ContactSettings {
  address: string;
  phone: string;
  email: string;
  hours: string;
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

export const contactDefaults: ContactSettings = {
  // Placeholders only — the owner overwrites these in Admin → Settings.
  address: "Your area",
  phone: "",
  email: "hello@drivinginstructorgloucester.co.uk",
  hours: "Mon–Sun, 8am–7pm",
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

export function getContactSettings(): Promise<ContactSettings> {
  return getSection<ContactSettings>("__site__", "contact", contactDefaults);
}

export function getSocialSettings(): Promise<SocialSettings> {
  return getSection<SocialSettings>("__site__", "social", socialDefaults);
}

export function getBrandingSettings(): Promise<BrandingSettings> {
  return getSection<BrandingSettings>("__site__", "branding", brandingDefaults);
}
