import { CLIENT_ROLE_LABELS } from "@/lib/auth/permissions";

export default function ClientTeamPage() {
  const roles = Object.entries(CLIENT_ROLE_LABELS);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-stone-900"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Team access
        </h1>
        <p className="mt-2 text-stone-600">
          Practice admins invite staff with administrative, editor, blogger, or
          view-only access — no shared passwords.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {roles.map(([key, label]) => (
          <article
            key={key}
            className="rounded-2xl border border-stone-200 bg-white p-4"
          >
            <h2 className="font-semibold text-stone-900">{label}</h2>
            <p className="mt-1 text-xs text-stone-500">{key}</p>
            <p className="mt-3 text-sm text-stone-600">
              {key === "CLIENT_ADMIN" &&
                "Manage team, pages, blog, SEO meta, and publish when allowed."}
              {key === "CLIENT_EDITOR" &&
                "Edit pages and media. Blog only if the agency enables it."}
              {key === "CLIENT_BLOGGER" &&
                "Create and edit blog posts only — no page builder or team."}
              {key === "CLIENT_VIEWER" &&
                "Read-only dashboard and previews."}
            </p>
          </article>
        ))}
      </div>

      <form className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold">Invite user</h2>
        <input
          type="email"
          placeholder="email@practice.com"
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm"
        />
        <select className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm">
          {roles.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white opacity-60"
        >
          Send invite (connect Clerk)
        </button>
      </form>
    </div>
  );
}
