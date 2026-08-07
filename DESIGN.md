# Dig Driving School — "Night Shift" design system

The public site is **dark, high-contrast and typographic**, built on the two
colours in the Dig logo: a deep navy base, the logo's **orange** as the action
colour, and the logo's **blue** as the structural accent.

## Palette

| Token | Hex | Use |
|---|---|---|
| void | `#070d18` | Page background, default section background |
| ink | `#0d1728` | Alternate section background, input fields |
| surface | `#131f34` | Card background |
| raised | `#1c2b45` | Hover card background |
| line | `#24354f` | All borders and dividers on dark |
| **orange** | `#f47c20` | Actions only: CTAs, eyebrows, stat numerals, focus rings |
| orange-dim | `#d2661a` | Gradient partner for orange |
| **blue** | `#1b5cb8` | Active nav, secondary buttons, logo mark |
| blue-light | `#2f7ae0` | Icon chips, grid backdrop, hover blue |
| paper | `#f4f6fa` | Light "contrast break" sections (text goes `#070d18`) |
| text | `#eef2f9` | Body text on dark |
| muted | `#94a5c0` | Secondary/body copy |
| faint | `#63779a` | Meta labels, captions |

**The split matters:** orange means *do something* — buttons, eyebrows, prices,
numbers. Blue is structure — icon chips (`.icon-chip`), the active nav pill, the
hero grid and glow. Don't use orange for decoration or the CTAs stop standing out.

Orange is a **highlight, never a large fill** — except deliberate full-bleed bands
(the marquee, the footer CTA card) where text flips to `#070d18`.

The logo artwork is drawn for a light background, so wherever it appears on dark
it sits on a **white plate** (see `Navbar.tsx`).

## Type

One typeface drives the site — **Montserrat** (`var(--font-montserrat)`), a clean,
modern geometric sans — used for both headings and body. JetBrains Mono is kept
only for the small eyebrow/label text.

- **Display** — Montserrat 700, `letter-spacing: -0.02em`, `line-height: 1.05`.
  All `h1/h2/h3` on the public site are forced **lowercase** by `globals.css`.
  Write headings in sentence case; the CSS handles the rest.
- **Body** — Montserrat 400–500, 0.92–1.08rem, `line-height: 1.65–1.75`.
- **Mono** — JetBrains Mono (`var(--font-mono)`) for eyebrows, labels, captions,
  stat sub-labels. Uppercase, `letter-spacing: 0.18–0.22em`, ~0.7rem.

Montserrat is loaded once in `layout.tsx` as `--font-montserrat`; there is no
separate display/body font. Heading sizes use `clamp()`: hero
`clamp(2.7rem, 7.5vw, 5.4rem)`, section `clamp(2rem, 5vw, 3.4rem)`, card `1.28rem`.

## Hero banners

Every page has a photographic hero at `public/banners/<page>.jpg` (1600×900),
wired in via `imageUrl` (+ `overlay: 55`) in each page's `cms-pages.ts` banner
entry. They're **free-licence stock photos from Pexels** (commercial use, no
attribution required), each chosen to match the page — e.g. a manual gear stick
for `/auto-vs-manual`, a learner at the wheel for `/enquiry`.

`bannerBg()` in `lib/content.ts` lays a two-part navy tint over any hero image: a
vertical darken for overall legibility plus a stronger left→right fade, so the
left-aligned heading stays readable while the photo shows through on the right.
That keeps bright photos on-brand (dark navy) and readable without hand-editing
each image.

To swap a photo: drop a 1600×900 image at the same path, or upload one in
Admin → Content (the CMS `imageUrl` overrides the file). Prefer images that
aren't too busy/bright on the left third.

**UK requirement:** any hero (or other) photo that shows a car's driving
position must be **right-hand drive** (driver/steering wheel on the right) — this
is a UK driving school. Drive-side-neutral shots (wheel close-ups, gear sticks,
keys, exteriors, road signs) are fine either way.

**Banner headings** are the page's single `<h1>`; `globals.css` forces them
lowercase but capitalises the first letter (`h1::first-letter`), so write the
heading text lowercase and it renders as "Sentence case first letter". Section
headings (`h2`) stay fully lowercase by design.

## Reusable classes (already in `globals.css`)

| Class | What it does |
|---|---|
| `.eyebrow` | Mono uppercase orange label with a leading dash rule |
| `.btn` + `.btn-accent` / `.btn-blue` / `.btn-ghost` / `.btn-dark` | Pill buttons, 999px radius |
| `.card` / `.card-accent` | 22px radius surface card, lifts on hover |
| `.icon-chip` | 46px blue-tinted rounded tile for a section icon |
| `.numeral` | Tabular Space Grotesk for oversized numbers |
| `.grid-bg` | Faint blue grid backdrop |
| `.spotlight` | Radial blue+orange glow (needs `position: relative` on the parent) |
| `.field` / `.field-label` | Dark form input + its label |
| `.bare` | Opt a link out of the automatic orange body-link styling |

## Layout rules

- Page container: `className="max-w-[1240px] mx-auto px-5"`.
- Section padding: `clamp(4.5rem, 10vw, 7.5rem) 0`.
- Card radius 22px, panel radius 26px, button radius 999px, input radius 14px.
- **Alternate section backgrounds** down the page: void → paper → void → ink → void.
  At least one `paper` section per page for contrast rhythm.
- Grids: `gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))"` — never fixed
  column counts in inline styles (they don't collapse on mobile).
- ⚠️ **Never put an inline `display` on an element that also uses a responsive
  Tailwind class** like `xl:hidden` — the inline style wins and the class silently
  does nothing. Wrap it in a `<div>` carrying the class instead.

## Signature devices — use these, they're what make the site distinct

1. **Oversized ghost numerals** — `01 02 03` in `.numeral` at 2.4–4.5rem in a barely
   visible colour (`#1e2e4a` on dark, `rgba(7,13,24,0.16)` on paper).
2. **Numbered divider rows** — list items separated by 1px rules with a huge index
   numeral in the left gutter, rather than boxed cards.
3. **Mono eyebrows** above every section heading.
4. **Pill everything** — buttons, tags, badges, avatars.
5. **Grid backdrop + spotlight** on hero sections.

## Content rules

- Copy is direct and human. No exclamation marks, no "Barry will…" third-person
  voice — write as "we".
- Never hardcode a town, phone number or email in a page. Read the town from
  `SITE` in `@/lib/site-config`, and contact details from `getContactSettings()`.
- Every editable string on the homepage comes from the CMS via `getSection()`.

## Data plumbing (unchanged from the backend)

```tsx
const banner = await getBanner("/prices", getCmsPage("/prices")!.banner);
const section = await getSection("/", "services", getSectionSchema("/", "services")!.defaults);
export async function generateMetadata() { return getPageMetadata("/prices", { title, description }); }
```

Pages with a CMS-managed hero render it inline with
`bannerBg(banner, "linear-gradient(170deg, #101c30 0%, #070d18 70%)")`, or use
the shared `<PageBanner slug fallback />` component.
