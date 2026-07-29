import Link from "next/link";
import {
  ensureAgencyOrganization,
  ensureDbUser,
} from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function AgencyOverviewPage() {
  let userName = "there";
  let orgName = "Your agency";
  let siteCount = 0;
  let dbOk = true;
  let dbError: string | null = null;

  try {
    const user = await ensureDbUser();
    if (user) {
      userName = user.name || user.email;
      const org = await ensureAgencyOrganization(
        user.id,
        user.name ? `${user.name}'s Agency` : "My Agency",
      );
      orgName = org.name;
      siteCount = await prisma.site.count({
        where: { organizationId: org.id },
      });
    }
  } catch (e) {
    dbOk = false;
    dbError = e instanceof Error ? e.message : "Database unavailable";
  }

  const kpis = [
    { label: "Sites", value: String(siteCount), href: "/agency/sites" },
    { label: "SEO fixes needed", value: "—", href: "/agency/sites" },
    { label: "QA failures", value: "—", href: "/agency/sites" },
    { label: "Publishes this week", value: "—", href: "/agency/sites" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl text-stone-900"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Hi, {userName}
          </h1>
          <p className="mt-2 text-stone-600">
            {orgName} — build dental sites, invite clients, publish to Lightsail.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/agency/build"
            className="rounded-full bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800"
          >
            Build from command
          </Link>
          <Link
            href="/agency/import"
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-800 hover:bg-stone-50"
          >
            Import Cornerstone
          </Link>
        </div>
      </div>

      {!dbOk && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">Database not connected yet</p>
          <p className="mt-1 opacity-90">
            {dbError}. Add a Postgres{" "}
            <code className="rounded bg-white/70 px-1">DATABASE_URL</code> in{" "}
            <code className="rounded bg-white/70 px-1">.env</code>, then run{" "}
            <code className="rounded bg-white/70 px-1">
              npx prisma migrate dev --name init
            </code>
            .
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-stone-500">
              {kpi.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-stone-900">
              {kpi.value}
            </p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">Setup checklist</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-stone-600">
          <li>
            Add Clerk keys (
            <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>,{" "}
            <code>CLERK_SECRET_KEY</code>) from the Clerk dashboard.
          </li>
          <li>
            Add Neon/Postgres <code>DATABASE_URL</code> and run migrations.
          </li>
          <li>Build a site from a command, then invite a client admin.</li>
        </ol>
      </section>
    </div>
  );
}
