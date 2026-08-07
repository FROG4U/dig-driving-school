# Dig Driving School

Marketing site + admin panel for Dig Driving School. Next.js 16 (App Router),
Prisma + SQLite, Tailwind v4. Everything on the public site is editable from the
admin panel without a redeploy.

## Running locally

```bash
npm install
npx prisma migrate deploy   # create / update the SQLite database
npm run seed                # create the two admin accounts
npm run dev                 # http://localhost:3007
```

Admin panel: <http://localhost:3007/admin/login>

| Account | Email | Role |
|---|---|---|
| Super Admin | `superadmin@digds.co.uk` | Full access, can manage other admins |
| Admin | `admin@digds.co.uk` | Day-to-day content editing |

Passwords are set in `prisma/seed.ts` — **change them before going live.**

## ⚠️ Before launch

1. **`src/lib/site-config.ts`** — replace the `YOUR TOWN` / `YOUR COUNTY` /
   `Nearby Town` placeholders with the real service area. Every SEO default,
   keyword suggestion and location page title is generated from this one file.
2. **Admin → Settings** — enter the real phone, email, address, opening hours,
   social links, and upload the logo + favicon.
3. **`.env`** — set a strong `JWT_SECRET`, plus `RESEND_API_KEY`, `EMAIL_FROM`
   and `OWNER_EMAIL` so enquiry notification emails actually send.
4. **`prisma/seed.ts`** — change both admin passwords, then re-run `npm run seed`.

## What the admin panel does

| Screen | Purpose |
|---|---|
| **Dashboard** | Enquiry counts and recent activity at a glance |
| **Enquiries** | Every form submission, with status tracking and reply-by-email |
| **Content** | Edit every page's hero banner and content sections (text, images, lists) |
| **Pages** | Overview of every page and whether it has SEO written |
| **SEO** | Per-page meta title/description/H1/keywords, with a one-click generator and a bulk "generate all" |
| **Competitors** | Add rival driving schools, scan their pages, and build a keyword bank of what they rank for |
| **Traffic** | First-party page-view analytics — no third-party trackers |
| **Settings** | Contact details, social links, logo and favicon |
| **Admins** | Manage admin accounts (Super Admin only) |

## Architecture notes

- **Content** — `src/lib/cms-pages.ts` holds each page's default hero;
  `src/lib/cms-sections.ts` defines the schema for every editable section. The
  admin Content editor renders its form from those schemas, so adding a new
  editable field is a one-line change in one file.
- **Fallbacks** — `getSection()` returns the code-level defaults if nothing is
  saved or the database is unreachable, so the site never renders empty.
- **Freshness** — the root layout sets `dynamic = "force-dynamic"`, so admin
  edits appear on the live site immediately with no rebuild.
- **Design** — see [DESIGN.md](DESIGN.md) for the full visual system. Read it
  before adding a page.

## Deployment

See [DEPLOY.md](DEPLOY.md) for the IONOS (Plesk + Passenger) setup.
