import Link from "next/link";

const kpis = [
  { label: "Sites live", value: "0", href: "/agency/sites" },
  { label: "SEO fixes needed", value: "0", href: "/agency/sites" },
  { label: "QA failures", value: "0", href: "/agency/sites" },
  { label: "Publishes this week", value: "0", href: "/agency/sites" },
];

export default function AgencyOverviewPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl text-stone-900"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Overview
          </h1>
          <p className="mt-2 text-stone-600">
            Build new dental sites, invite clients, and publish to Lightsail.
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
        <h2 className="text-lg font-semibold text-stone-900">Getting started</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-stone-600">
          <li>Connect Postgres (`DATABASE_URL`) and run `npx prisma migrate dev`.</li>
          <li>Add Clerk keys for agency and client logins.</li>
          <li>Build a site from a command or import an existing Cornerstone site.</li>
          <li>Invite the practice admin — they manage editors and bloggers.</li>
        </ol>
      </section>
    </div>
  );
}
