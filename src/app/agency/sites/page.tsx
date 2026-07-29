"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SiteRow = {
  id: string;
  name: string;
  slug: string;
  practiceName: string | null;
  city: string | null;
  state: string | null;
  pageCount: number;
  postCount: number;
  memberCount: number;
};

export default function AgencySitesPage() {
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/sites");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load sites");
        if (!cancelled) setSites(data.sites);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

      {loading && (
        <p className="text-sm text-stone-500">Loading sites…</p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
          {error.toLowerCase().includes("connect") ||
          error.toLowerCase().includes("database") ||
          error.toLowerCase().includes("prisma")
            ? " — set DATABASE_URL and run prisma migrate."
            : ""}
        </p>
      )}

      {!loading && !error && sites.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-12 text-center">
          <p className="text-stone-700">No sites yet.</p>
          <p className="mt-2 text-sm text-stone-500">
            Use Build from command or Import Cornerstone to create the first one.
          </p>
        </div>
      )}

      {sites.length > 0 && (
        <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {sites.map((site) => (
            <li
              key={site.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="font-semibold text-stone-900">{site.name}</p>
                <p className="text-sm text-stone-500">
                  {[site.city, site.state].filter(Boolean).join(", ") || "—"} · /
                  {site.slug}
                </p>
              </div>
              <p className="text-sm text-stone-600">
                {site.pageCount} pages · {site.postCount} posts ·{" "}
                {site.memberCount} clients
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
