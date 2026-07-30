# AGENTS.md

## Cursor Cloud specific instructions

Single Next.js 16 app (`websitebuildersaas`) — a multi-tenant dental website builder.
Stack: Next.js App Router + TypeScript + Tailwind v4, Prisma + PostgreSQL, Clerk auth.
Standard scripts live in `package.json` (`dev`, `build`, `start`, `lint`, `db:generate`,
`db:migrate`, `db:push`); README has the human setup guide.

### Services / how to run

- **App:** `npm run dev` → http://localhost:3000 (Turbopack). Lint: `npm run lint`.
- **PostgreSQL:** installed locally in the VM. Start it (not auto-started on boot) with
  `sudo pg_ctlcluster 16 main start`. DB `websitebuildersaas` exists with role
  `postgres`/`postgres`. `.env` `DATABASE_URL` already points at it. If the DB/role is
  missing on a fresh pod, recreate with
  `sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"` and
  `sudo -u postgres psql -c "CREATE DATABASE websitebuildersaas;"`, then `npm run db:push`.
- **Sync the DB schema with `npm run db:push`** (`prisma db push`), NOT `migrate deploy`.
  The committed migrations in `prisma/migrations/` lag `prisma/schema.prisma` (recent
  columns like `Site.headerConfig`/`footerConfig`/`chrome` have no migration yet), so
  `migrate deploy` leaves the DB missing columns and the build path fails with Prisma
  `P2022`. `db push` reconciles the live DB to the schema and regenerates the client.
- No test framework is configured (no `test` script) — verification is manual via the app.

### Non-obvious gotchas

- **`.env` is gitignored** — copy `.env.example` → `.env` if missing.
- **Clerk keyless mode:** leave `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
  **blank** in `.env`. Clerk then auto-provisions a temporary dev instance and prints a
  "claim your keys" URL, and the whole app works. The `.env.example` placeholders
  (`pk_test_...` / `sk_test_...`) are **invalid** and make every route (even `/api/health`
  and `/`) return a 500 `Publishable key not valid.` — always clear them, or set real keys.
- **Browser sign-up limitation in keyless mode:** the shared keyless Clerk instance loads
  a Cloudflare Turnstile CAPTCHA that errors on `localhost` (Turnstile error `600010`),
  which blocks completing sign-up through the UI. To test protected flows end-to-end in a
  browser, set **real** Clerk dev keys in `.env`; then test emails of the form
  `name+clerk_test@example.com` with the fixed verification code `424242` bypass the CAPTCHA.
  Without a browser login, the core "command build → DB" logic (`createSiteFromCommand` in
  `src/lib/build/create-site.ts`, called by `POST /api/sites/build`) can be exercised
  directly against Postgres via a short `tsx` script.
- Everything except `/`, `/sign-in`, `/sign-up`, `/api/health` is auth-protected via
  `src/proxy.ts` (Next.js middleware is named `proxy.ts` in Next 16).
- Optional integrations (OpenAI, Phrasly/RewriteAI, Copyleaks, Grammarly, Inngest, AWS
  Lightsail) degrade gracefully when their API keys are absent — not needed to run/build.
