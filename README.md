# Dental SEO Builder SaaS

Multi-tenant dental website builder focused on SEO. Agencies and clients can:

- **Build new sites** from a natural-language command or templates
- **Import** Cornerstone/WordPress sites (content extraction — no CS JavaScript shipped)
- Edit with **locked H1/H2/H3**, mandatory FAQs, and guided schemas
- Auto-generate **sitemap.xml**, **robots.txt**, and **llms.txt** on publish
- Auto **ALT** (vision AI) + **GPS EXIF** from practice address
- Content QA: **Phrasly/RewriteAI humanize → Copyleaks verify** (separate vendors)
- **Client logins** with admin / editor / blogger / viewer roles and team management
- Publish each site to its **own AWS Lightsail** instance

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- PostgreSQL + Prisma
- Clerk (auth)
- Inngest (jobs — import, QA, deploy)

## Setup

### 1. Clone & install

```bash
git clone https://github.com/riteshaffrodabledentist/websitebuildersaas.git
cd websitebuildersaas
npm install
cp .env.example .env
```

### 2. Clerk keys

1. Create an app at [clerk.com](https://dashboard.clerk.com)
2. Copy **Publishable key** and **Secret key** into `.env`
3. In Clerk → Paths, set sign-in `/sign-in` and sign-up `/sign-up`

### 3. Postgres

Use [Neon](https://neon.tech) (free) or any Postgres. Put the connection string in `.env` as `DATABASE_URL`.

```bash
npx prisma migrate dev
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `/` — marketing + sign in
- `/agency` — agency dashboard (protected)
- `/agency/build` — create a site from a command (writes to DB)
- `/client` — client dashboard (protected)
- `/api/me` — current user + org sync
- `/api/health` — public health check

## Repo

https://github.com/riteshaffrodabledentist/websitebuildersaas

## Status

Auth (Clerk) + Prisma model + command build → DB are wired. Next: page editor, content QA APIs, Cornerstone import jobs, Lightsail publish.
