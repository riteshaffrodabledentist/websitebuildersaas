export default function AgencyImportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1
          className="text-3xl text-stone-900"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Import Cornerstone
        </h1>
        <p className="mt-2 text-stone-600">
          We snapshot rendered content, strip all Cornerstone/theme JavaScript,
          map into our sections, and attach full SEO (FAQ, schemas, meta).
          Animations are rebuilt with our lightweight motion — never CS runtime.
        </p>
      </div>
      <form className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
        <label className="block text-sm">
          <span className="font-medium text-stone-700">Website URL</span>
          <input
            type="url"
            placeholder="https://exampledental.com"
            className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none ring-teal-600 focus:ring-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" defaultChecked className="rounded border-stone-300" />
          Import WordPress blog posts via REST API
        </label>
        <button
          type="button"
          disabled
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white opacity-60"
        >
          Start import (wire Inngest + Playwright next)
        </button>
      </form>
    </div>
  );
}
