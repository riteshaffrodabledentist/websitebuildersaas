"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_HOURS,
  SERVICE_OPTIONS,
  emptyQuestionnaire,
  type SiteQuestionnaire,
} from "@/lib/build/questionnaire";
import {
  commandSitePages,
  parseBuildCommand,
} from "@/lib/build/command-site";

const STEPS = [
  "Business",
  "Services",
  "Websites",
  "Hours",
  "Insurance & financing",
  "Review",
] as const;

export default function BuildSitePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"questionnaire" | "command">("questionnaire");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SiteQuestionnaire>(emptyQuestionnaire());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    name: string;
    slug: string;
    pageCount: number;
  } | null>(null);

  const [command, setCommand] = useState(
    "Build a site for Smile Dental, Austin TX, implants and Invisalign, phone 512-555-0100",
  );

  const parsedCommand = useMemo(() => {
    try {
      return parseBuildCommand(command);
    } catch {
      return null;
    }
  }, [command]);

  function update<K extends keyof SiteQuestionnaire>(
    key: K,
    value: SiteQuestionnaire[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleService(service: string) {
    setForm((prev) => {
      const has = prev.focusServices.includes(service);
      return {
        ...prev,
        focusServices: has
          ? prev.focusServices.filter((s) => s !== service)
          : [...prev.focusServices, service],
      };
    });
  }

  async function submitQuestionnaire() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/sites/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  async function submitCommand() {
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
      if (!res.ok) throw new Error(data.error || "Failed to create site");
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
          Build a dental website
        </h1>
        <p className="mt-2 text-stone-600">
          Answer a short questionnaire (recommended), or use a free-form command.
        </p>
      </div>

      <div className="flex gap-2 rounded-full border border-stone-200 bg-white p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode("questionnaire")}
          className={`rounded-full px-4 py-2 text-sm ${
            mode === "questionnaire"
              ? "bg-teal-700 text-white"
              : "text-stone-700"
          }`}
        >
          Questionnaire
        </button>
        <button
          type="button"
          onClick={() => setMode("command")}
          className={`rounded-full px-4 py-2 text-sm ${
            mode === "command" ? "bg-teal-700 text-white" : "text-stone-700"
          }`}
        >
          Command
        </button>
      </div>

      {mode === "command" ? (
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-stone-300 p-4 text-sm outline-none ring-teal-600 focus:ring-2"
          />
          {parsedCommand && (
            <p className="text-sm text-stone-600">
              Will create {commandSitePages(parsedCommand).length} pages for{" "}
              <strong>{parsedCommand.practiceName}</strong>
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {result && (
            <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">
              Created <strong>{result.name}</strong> ({result.pageCount} pages).{" "}
              <a href="/agency/sites" className="underline">
                View sites
              </a>
            </p>
          )}
          <button
            type="button"
            disabled={busy || !parsedCommand}
            onClick={submitCommand}
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create site"}
          </button>
        </div>
      ) : (
        <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex flex-wrap gap-2">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(i)}
                className={`rounded-full px-3 py-1 text-xs ${
                  i === step
                    ? "bg-teal-700 text-white"
                    : i < step
                      ? "bg-teal-50 text-teal-900"
                      : "bg-stone-100 text-stone-500"
                }`}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>

          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Business name *" className="sm:col-span-2">
                <input
                  value={form.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                  className="input"
                  placeholder="Smile Dental"
                />
              </Field>
              <Field label="Google Business name" className="sm:col-span-2">
                <input
                  value={form.googleBusinessName || ""}
                  onChange={(e) => update("googleBusinessName", e.target.value)}
                  className="input"
                  placeholder="Same as Google listing if different"
                />
              </Field>
              <Field label="Phone *">
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="input"
                  placeholder="+91 ... or (512) ..."
                />
              </Field>
              <Field label="Email">
                <input
                  value={form.email || ""}
                  onChange={(e) => update("email", e.target.value)}
                  className="input"
                  placeholder="hello@practice.com"
                />
              </Field>
              <Field label="Street address" className="sm:col-span-2">
                <input
                  value={form.addressLine1 || ""}
                  onChange={(e) => update("addressLine1", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="City">
                <input
                  value={form.city || ""}
                  onChange={(e) => update("city", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="State">
                <input
                  value={form.state || ""}
                  onChange={(e) => update("state", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Postal code">
                <input
                  value={form.postalCode || ""}
                  onChange={(e) => update("postalCode", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Country">
                <input
                  value={form.country || "US"}
                  onChange={(e) => update("country", e.target.value)}
                  className="input"
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-stone-600">
                Select focus services (at least one). These become service pages.
              </p>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((service) => {
                  const on = form.focusServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`rounded-full border px-3 py-1.5 text-sm ${
                        on
                          ? "border-teal-700 bg-teal-700 text-white"
                          : "border-stone-300 bg-white text-stone-700"
                      }`}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3">
              <Field label="Current website (to clone or replace later)">
                <input
                  value={form.currentWebsiteUrl || ""}
                  onChange={(e) => update("currentWebsiteUrl", e.target.value)}
                  className="input"
                  placeholder="https://old-site.com"
                />
              </Field>
              <Field label="Inspiration website">
                <input
                  value={form.inspirationWebsiteUrl || ""}
                  onChange={(e) =>
                    update("inspirationWebsiteUrl", e.target.value)
                  }
                  className="input"
                  placeholder="https://site-you-like.com"
                />
              </Field>
              <p className="text-xs text-stone-500">
                Inspiration is stored for design direction. Current site can be
                imported via Cornerstone import later.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {(form.businessHours?.length
                ? form.businessHours
                : DEFAULT_HOURS
              ).map((row, idx) => (
                <div
                  key={row.day}
                  className="grid grid-cols-[7rem_auto_1fr_1fr] items-center gap-2 text-sm"
                >
                  <span className="capitalize font-medium">{row.day}</span>
                  <label className="flex items-center gap-1 text-stone-600">
                    <input
                      type="checkbox"
                      checked={row.closed}
                      onChange={(e) => {
                        const next = [...(form.businessHours || DEFAULT_HOURS)];
                        next[idx] = { ...next[idx], closed: e.target.checked };
                        update("businessHours", next);
                      }}
                    />
                    Closed
                  </label>
                  <input
                    type="time"
                    disabled={row.closed}
                    value={row.open || "09:00"}
                    onChange={(e) => {
                      const next = [...(form.businessHours || DEFAULT_HOURS)];
                      next[idx] = { ...next[idx], open: e.target.value };
                      update("businessHours", next);
                    }}
                    className="input"
                  />
                  <input
                    type="time"
                    disabled={row.closed}
                    value={row.close || "17:00"}
                    onChange={(e) => {
                      const next = [...(form.businessHours || DEFAULT_HOURS)];
                      next[idx] = { ...next[idx], close: e.target.value };
                      update("businessHours", next);
                    }}
                    className="input"
                  />
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-stone-800">
                <input
                  type="checkbox"
                  checked={form.insuranceAccepted}
                  onChange={(e) =>
                    update("insuranceAccepted", e.target.checked)
                  }
                />
                We accept dental insurance
              </label>
              <Field label="Insurance details (plans, notes)">
                <textarea
                  value={form.insuranceInfo || ""}
                  onChange={(e) => update("insuranceInfo", e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="Delta Dental, Cigna, in-network notes…"
                />
              </Field>
              <Field label="Financing information">
                <textarea
                  value={form.financingInfo || ""}
                  onChange={(e) => update("financingInfo", e.target.value)}
                  rows={3}
                  className="input"
                  placeholder="CareCredit, in-house plans, 0% promos…"
                />
              </Field>
              <Field label="Anything else we should know?">
                <textarea
                  value={form.extraNotes || ""}
                  onChange={(e) => update("extraNotes", e.target.value)}
                  rows={2}
                  className="input"
                />
              </Field>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3 text-sm text-stone-700">
              <p>
                <strong>{form.businessName || "—"}</strong>
                {form.googleBusinessName
                  ? ` · GBP: ${form.googleBusinessName}`
                  : ""}
              </p>
              <p>
                {form.phone} · {[form.city, form.state].filter(Boolean).join(", ")}
              </p>
              <p>Services: {form.focusServices.join(", ") || "—"}</p>
              <p>
                Current site: {form.currentWebsiteUrl || "—"} · Inspiration:{" "}
                {form.inspirationWebsiteUrl || "—"}
              </p>
              <p>
                Insurance: {form.insuranceAccepted ? "Yes" : "No"}
                {form.financingInfo ? " · Financing notes included" : ""}
              </p>
              <p className="text-stone-500">
                We’ll create Home, About, service pages, Location, Contact, FAQ
                on every page, plus Financing if you provided financing info.
              </p>
            </div>
          )}

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

          <div className="flex justify-between pt-2">
            <button
              type="button"
              disabled={step === 0 || busy}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="rounded-full bg-teal-700 px-4 py-2 text-sm text-white"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || !form.businessName || !form.phone}
                onClick={submitQuestionnaire}
                className="rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white disabled:opacity-50"
              >
                {busy ? "Creating…" : "Create website"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1.5 block font-medium text-stone-700">{label}</span>
      <div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-stone-300 [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-sm [&_input]:outline-none focus-within:[&_input]:ring-2 focus-within:[&_input]:ring-teal-700/40 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-stone-300 [&_textarea]:px-3.5 [&_textarea]:py-2.5 [&_textarea]:text-sm [&_textarea]:outline-none">
        {children}
      </div>
    </label>
  );
}
