# Deploying Dig Driving School

Stack: **Next.js 16 + Prisma (SQLite)**, served by **Phusion Passenger** on
Plesk / IONOS, code hosted on **GitHub**, auto-deployed on every push to `main`.

## The two kinds of "update" (important)

1. **Content edits** — anything you change in the admin panel at **`/dds`**
   (banners, text, prices, photos, SEO, settings) saves to the server database
   and appears on the live site **instantly**. No rebuild, no deploy — every
   public page is `force-dynamic`.

2. **Code / design changes** — new features, layout, colours, new pages. These
   need a build. That's what the **auto-deploy** below does: push to GitHub →
   the live site rebuilds and restarts itself.

---

## One-time server setup (Plesk)

1. **Create the domain/subdomain** in Plesk (e.g. `digdrivingschool.co.uk`).
   You can point the real domain at it later via DNS — no rebuild needed.

2. **Node.js app** in Plesk (Websites & Domains → Node.js):
   - **Application root:** the repo folder (e.g. `httpdocs`)
   - **Application startup file:** `server.js`
   - **Environment variables** (Plesk → Node.js → Custom environment variables):
     ```
     DATABASE_URL=file:./prisma/dev.db
     JWT_SECRET=<run: openssl rand -base64 32>
     NODE_ENV=production
     # Email (optional — enquiries still save without it):
     RESEND_API_KEY=<from resend.com, or leave blank>
     EMAIL_FROM=Dig Driving School <hello@digdrivingschool.co.uk>
     OWNER_EMAIL=<inbox that receives enquiry notifications>
     ```

3. **First deploy** — SSH into the server, then:
   ```bash
   cd <APP_PATH>
   git clone git@github.com:FROG4U/dig-driving-school.git .
   npm ci
   npx prisma migrate deploy   # creates the SQLite database
   npm run seed                # creates the two admin logins
   npm run build
   ```
   Then click **Restart App** in Plesk. The site is live.

Admin login: `https://<your-domain>/dds`
Seeded accounts (⚠️ change these — see Notes):
`superadmin@digds.co.uk` and `admin@digds.co.uk`.

## Auto-deploy (push → live)

Add these **GitHub repo secrets** (repo → Settings → Secrets and variables →
Actions → New repository secret):

| Secret | Value |
|---|---|
| `SSH_HOST` | your server hostname or IP |
| `SSH_USER` | your SSH / Plesk system user |
| `SSH_KEY` | the **private** SSH key whose public key is on the server |
| `SSH_PORT` | usually `22` |
| `APP_PATH` | absolute path to the app, e.g. `/var/www/vhosts/digdrivingschool.co.uk/httpdocs` |

After that, `.github/workflows/deploy.yml` runs on every push to `main`:
**pull → install → migrate → build → restart.** Fully automatic.

> Prefer no GitHub Actions? In Plesk → **Git**, connect this repo, enable the
> webhook (pull on push), and set "Additional deployment actions" to:
> `npm ci && npx prisma migrate deploy && npm run build && mkdir -p tmp && touch tmp/restart.txt`

## Notes

- The SQLite DB (`prisma/dev.db`) and `/public/uploads` live **only on the
  server** (both git-ignored), so deploys never wipe your content or images.
- **Before go-live:** set the real service area in `src/lib/site-config.ts`
  (town / county / nearby towns) — every page title, SEO blurb and "areas we
  cover" list is generated from it.
- **Change the admin passwords.** They're set in `prisma/seed.ts`; edit both
  `bcrypt.hash(...)` lines, commit, push, then re-run `npm run seed` on the
  server (or delete the two rows and re-seed).
- Enter the real phone, email, address, hours, socials and logo in
  **`/dds` → Settings** after first login.
