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
- Clerk (auth — wire keys to enable)
- Inngest (jobs — import, QA, deploy)

## Quick start

```bash
cp .env.example .env
# set DATABASE_URL (Neon/Postgres) and optional Clerk/AI keys

npm install
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `/agency` — agency dashboard, command build, import
- `/client` — client dashboard, pages, blog, team

## Repo

https://github.com/riteshaffrodabledentist/websitebuildersaas

## Status

Foundation scaffold: data model, SEO/schema helpers, command parser, agency/client UI shells. Next: Clerk wiring, Prisma migrations against a live DB, Inngest import/publish jobs, and Lightsail deploy.
