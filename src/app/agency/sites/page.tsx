import Link from "next/link";

export default function AgencySitesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl text-stone-900"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Sites
          </h1>
          <p className="mt-2 text-stone-600">
            Each live site publishes to its own Lightsail instance.
          </p>
        </div>
        <Link
          href="/agency/build"
          className="rounded-full bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800"
        >
          New site
        </Link>
      </div>
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-12 text-center">
        <p className="text-stone-700">No sites yet.</p>
        <p className="mt-2 text-sm text-stone-500">
          Use Build from command or Import Cornerstone to create the first one.
        </p>
      </div>
    </div>
  );
}
