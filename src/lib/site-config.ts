/**
 * Single source of truth for the school's identity and service area.
 *
 * Everything that isn't editable from the admin panel (SEO keyword defaults,
 * generated meta suggestions, location page titles) reads from here — so
 * changing the town the school covers is a one-line edit in this file.
 *
 * Live contact details (phone, email, address, hours) are NOT here: those are
 * edited by the owner in Admin → Settings and stored in the database.
 */
export const SITE = {
  /** Brand name as it appears in titles and meta descriptions. */
  name: "Dig Driving School",
  // ⚠️ PLACEHOLDERS — replace these four before the site goes live.
  /** Primary town / city the school operates in. */
  location: "YOUR TOWN",
  /** Wider county or region used for county-level SEO pages. */
  county: "YOUR COUNTY",
  /** Nearby towns used to generate extra location landing pages. */
  nearbyTowns: ["Nearby Town A", "Nearby Town B", "Nearby Town C"],
  /** Public site URL, used for sitemap and canonical links. */
  url: "https://digdrivingschool.co.uk",
} as const;
