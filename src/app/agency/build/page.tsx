"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  commandSitePages,
  parseBuildCommand,
} from "@/lib/build/command-site";

export default function BuildFromCommandPage() {
  const router = useRouter();
  const [command, setCommand] = useState(
    "Build a site for Smile Dental, Austin TX, implants and Invisalign, phone 512-555-0100",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    name: string;
    slug: string;
    pageCount: number;
  } | null>(null);

  const parsed = useMemo(() => {
    try {
      return parseBuildCommand(command);
    } catch {
      return null;
    }
  }, [command]);

  const pages = parsed ? commandSitePages(parsed) : [];

  async function onCreate() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/sites/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create site");
      }
      setResult(data.site);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1
          className="text-3xl text-stone-900"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Build from command
        </h1>
        <p className="mt-2 text-stone-600">
          Describe the practice. We scaffold pages, SEO fields, FAQs, and
          schemas — then you refine in the editor.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-stone-700">Command</span>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          rows={4}
          className="mt-2 w-full rounded-xl border border-stone-300 bg-white p-4 text-sm text-stone-900 outline-none ring-teal-600 focus:ring-2"
        />
      </label>

      {parsed && (
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">Preview scaffold</h2>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-stone-500">Practice</dt>
              <dd className="font-medium">{parsed.practiceName}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Location</dt>
              <dd className="font-medium">
                {[parsed.city, parsed.state].filter(Boolean).join(", ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-stone-500">Phone</dt>
              <dd className="font-medium">{parsed.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Services</dt>
              <dd className="font-medium">
                {parsed.services.length ? parsed.services.join(", ") : "—"}
              </dd>
            </div>
          </dl>
          <ul className="divide-y divide-stone-100 rounded-xl border border-stone-100">
            {pages.map((page) => (
              <li
                key={`${page.slug}-${page.title}`}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="font-medium text-stone-900">{page.title}</span>
                <span className="text-stone-500">
                  /{page.slug || ""} · {page.template} · H1 locked
                </span>
              </li>
            ))}
          </ul>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {result && (
            <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">
              Created <strong>{result.name}</strong> with {result.pageCount}{" "}
              pages.{" "}
              <a href="/agency/sites" className="underline">
                View sites
              </a>
            </p>
          )}
          <button
            type="button"
            onClick={onCreate}
            disabled={busy || !parsed}
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create site"}
          </button>
        </div>
      )}
    </div>
  );
}
