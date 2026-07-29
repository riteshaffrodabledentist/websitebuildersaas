import Link from "next/link";

export default function ClientHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl text-stone-900"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Your practice sites
        </h1>
        <p className="mt-2 text-stone-600">
          Edit content, manage your team, and keep SEO checklist items green.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Needs your edits", value: "0", href: "/client/pages" },
          { label: "Draft pages", value: "0", href: "/client/pages" },
          { label: "Team members", value: "0", href: "/client/team" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-stone-200 bg-white p-4 hover:border-teal-300"
          >
            <p className="text-xs uppercase tracking-wide text-stone-500">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/client/pages"
          className="rounded-full bg-teal-700 px-4 py-2 text-sm text-white"
        >
          Create page
        </Link>
        <Link
          href="/client/team"
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm"
        >
          Invite teammate
        </Link>
      </div>
    </div>
  );
}
