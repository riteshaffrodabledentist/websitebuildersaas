"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_HOURS,
  FINANCING_OPTIONS,
  INSURANCE_LOGO_OPTIONS,
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
  "About & people",
  "Services",
  "Websites",
  "Hours",
  "New patients",
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

  function toggleInList(
    key: "focusServices" | "insuranceLogos" | "financingProviders",
    value: string,
  ) {
    setForm((prev) => {
      const list = prev[key];
      const has = list.includes(value);
      return {
        ...prev,
        [key]: has ? list.filter((s) => s !== value) : [...list, value],
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
      if (!res.ok) throw new Error(data.error || "Failed to create site");
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
          Full site IA: About (doctors + team), Services, New Patients
          (forms / insurance / financing / membership), Contact, and Blog.
        </p>
      </div>

      <div className="flex w-fit gap-2 rounded-full border border-stone-200 bg-white p-1">
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
            className="field"
          />
          {parsedCommand && (
            <p className="text-sm text-stone-600">
              Quick scaffold for <strong>{parsedCommand.practiceName}</strong>{" "}
              ({commandSitePages(parsedCommand).length}+ core pages; prefer
              questionnaire for full IA).
            </p>
          )}
          <ResultBlock error={error} result={result} />
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
                  className="field"
                />
              </Field>
              <Field label="Google Business name" className="sm:col-span-2">
                <input
                  value={form.googleBusinessName || ""}
                  onChange={(e) => update("googleBusinessName", e.target.value)}
                  className="field"
                />
              </Field>
              <Field label="Phone *">
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="field"
                />
              </Field>
              <Field label="Email">
                <input
                  value={form.email || ""}
                  onChange={(e) => update("email", e.target.value)}
                  className="field"
                />
              </Field>
              <Field label="Street address" className="sm:col-span-2">
                <input
                  value={form.addressLine1 || ""}
                  onChange={(e) => update("addressLine1", e.target.value)}
                  className="field"
                />
              </Field>
              <Field label="City">
                <input
                  value={form.city || ""}
                  onChange={(e) => update("city", e.target.value)}
                  className="field"
                />
              </Field>
              <Field label="State">
                <input
                  value={form.state || ""}
                  onChange={(e) => update("state", e.target.value)}
                  className="field"
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <Field label="About Us content (full story for /about)">
                <textarea
                  value={form.aboutContent || ""}
                  onChange={(e) => update("aboutContent", e.target.value)}
                  rows={5}
                  className="field"
                  placeholder="Paste existing about text — we can rewrite/humanize later"
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.fetchAboutFromCurrentSite}
                  onChange={(e) =>
                    update("fetchAboutFromCurrentSite", e.target.checked)
                  }
                />
                Later: fetch About from current website & rewrite (flag for import job)
              </label>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Doctors (individual pages)</h3>
                  <button
                    type="button"
                    className="text-sm text-teal-700"
                    onClick={() =>
                      update("doctors", [
                        ...form.doctors,
                        { name: "", credentials: "DDS", title: "Dentist", bio: "" },
                      ])
                    }
                  >
                    + Add doctor
                  </button>
                </div>
                <div className="space-y-3">
                  {form.doctors.map((doc, idx) => (
                    <div
                      key={idx}
                      className="grid gap-2 rounded-xl border border-stone-200 p-3 sm:grid-cols-2"
                    >
                      <input
                        className="field"
                        placeholder="Name *"
                        value={doc.name}
                        onChange={(e) => {
                          const next = [...form.doctors];
                          next[idx] = { ...next[idx], name: e.target.value };
                          update("doctors", next);
                        }}
                      />
                      <input
                        className="field"
                        placeholder="Credentials (DDS)"
                        value={doc.credentials || ""}
                        onChange={(e) => {
                          const next = [...form.doctors];
                          next[idx] = {
                            ...next[idx],
                            credentials: e.target.value,
                          };
                          update("doctors", next);
                        }}
                      />
                      <input
                        className="field sm:col-span-2"
                        placeholder="Title"
                        value={doc.title || ""}
                        onChange={(e) => {
                          const next = [...form.doctors];
                          next[idx] = { ...next[idx], title: e.target.value };
                          update("doctors", next);
                        }}
                      />
                      <textarea
                        className="field sm:col-span-2"
                        rows={2}
                        placeholder="Bio"
                        value={doc.bio || ""}
                        onChange={(e) => {
                          const next = [...form.doctors];
                          next[idx] = { ...next[idx], bio: e.target.value };
                          update("doctors", next);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">
                    Team (bios on Meet the Team only — no individual pages)
                  </h3>
                  <button
                    type="button"
                    className="text-sm text-teal-700"
                    onClick={() =>
                      update("teamMembers", [
                        ...form.teamMembers,
                        { name: "", role: "", bio: "" },
                      ])
                    }
                  >
                    + Add team member
                  </button>
                </div>
                <div className="space-y-3">
                  {form.teamMembers.map((tm, idx) => (
                    <div
                      key={idx}
                      className="grid gap-2 rounded-xl border border-stone-200 p-3 sm:grid-cols-2"
                    >
                      <input
                        className="field"
                        placeholder="Name"
                        value={tm.name}
                        onChange={(e) => {
                          const next = [...form.teamMembers];
                          next[idx] = { ...next[idx], name: e.target.value };
                          update("teamMembers", next);
                        }}
                      />
                      <input
                        className="field"
                        placeholder="Role"
                        value={tm.role || ""}
                        onChange={(e) => {
                          const next = [...form.teamMembers];
                          next[idx] = { ...next[idx], role: e.target.value };
                          update("teamMembers", next);
                        }}
                      />
                      <textarea
                        className="field sm:col-span-2"
                        rows={2}
                        placeholder="Bio"
                        value={tm.bio || ""}
                        onChange={(e) => {
                          const next = [...form.teamMembers];
                          next[idx] = { ...next[idx], bio: e.target.value };
                          update("teamMembers", next);
                        }}
                      />
                    </div>
                  ))}
                  {form.teamMembers.length === 0 && (
                    <p className="text-sm text-stone-500">
                      Optional — you can add team later in the CMS.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((service) => {
                const on = form.focusServices.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleInList("focusServices", service)}
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
          )}

          {step === 3 && (
            <div className="grid gap-3">
              <Field label="Current website">
                <input
                  value={form.currentWebsiteUrl || ""}
                  onChange={(e) => update("currentWebsiteUrl", e.target.value)}
                  className="field"
                  placeholder="https://..."
                />
              </Field>
              <Field label="Inspiration website">
                <input
                  value={form.inspirationWebsiteUrl || ""}
                  onChange={(e) =>
                    update("inspirationWebsiteUrl", e.target.value)
                  }
                  className="field"
                  placeholder="https://..."
                />
              </Field>
            </div>
          )}

          {step === 4 && (
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
                    className="field"
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
                    className="field"
                  />
                </div>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <Field label="New patient welcome text">
                <textarea
                  value={form.newPatientWelcome || ""}
                  onChange={(e) => update("newPatientWelcome", e.target.value)}
                  rows={3}
                  className="field"
                />
              </Field>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">Paperwork (PDF or direct link)</h3>
                  <button
                    type="button"
                    className="text-sm text-teal-700"
                    onClick={() =>
                      update("patientForms", [
                        ...form.patientForms,
                        {
                          title: "",
                          description: "",
                          kind: "LINK",
                          url: "",
                        },
                      ])
                    }
                  >
                    + Add form
                  </button>
                </div>
                <p className="mb-3 text-xs text-stone-500">
                  Use a hosted PDF URL or any external paperwork link (Google
                  Form, DocuSign, practice portal, etc.). Clients can add more
                  later in the CMS.
                </p>
                <div className="space-y-3">
                  {form.patientForms.map((pf, idx) => (
                    <div
                      key={idx}
                      className="grid gap-2 rounded-xl border border-stone-200 p-3 sm:grid-cols-2"
                    >
                      <input
                        className="field"
                        placeholder="Form title *"
                        value={pf.title}
                        onChange={(e) => {
                          const next = [...form.patientForms];
                          next[idx] = { ...next[idx], title: e.target.value };
                          update("patientForms", next);
                        }}
                      />
                      <select
                        className="field"
                        value={pf.kind}
                        onChange={(e) => {
                          const next = [...form.patientForms];
                          next[idx] = {
                            ...next[idx],
                            kind: e.target.value as "PDF" | "LINK",
                          };
                          update("patientForms", next);
                        }}
                      >
                        <option value="PDF">PDF file URL</option>
                        <option value="LINK">Direct link</option>
                      </select>
                      <input
                        className="field sm:col-span-2"
                        placeholder={
                          pf.kind === "PDF"
                            ? "https://.../new-patient.pdf"
                            : "https://forms.example.com/new-patient"
                        }
                        value={pf.url}
                        onChange={(e) => {
                          const next = [...form.patientForms];
                          next[idx] = { ...next[idx], url: e.target.value };
                          update("patientForms", next);
                        }}
                      />
                      <input
                        className="field sm:col-span-2"
                        placeholder="Short description (optional)"
                        value={pf.description || ""}
                        onChange={(e) => {
                          const next = [...form.patientForms];
                          next[idx] = {
                            ...next[idx],
                            description: e.target.value,
                          };
                          update("patientForms", next);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.insuranceAccepted}
                  onChange={(e) =>
                    update("insuranceAccepted", e.target.checked)
                  }
                />
                Accept dental insurance
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.insuranceInNetwork}
                  onChange={(e) =>
                    update("insuranceInNetwork", e.target.checked)
                  }
                />
                We are an in-network office
              </label>
              <Field label="Insurance details">
                <textarea
                  value={form.insuranceInfo || ""}
                  onChange={(e) => update("insuranceInfo", e.target.value)}
                  rows={2}
                  className="field"
                />
              </Field>
              <div>
                <p className="mb-2 text-sm font-medium">Insurance logos / plans</p>
                <div className="flex flex-wrap gap-2">
                  {INSURANCE_LOGO_OPTIONS.map((name) => {
                    const on = form.insuranceLogos.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleInList("insuranceLogos", name)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          on
                            ? "border-teal-700 bg-teal-700 text-white"
                            : "border-stone-300"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Financing options</p>
                <div className="flex flex-wrap gap-2">
                  {FINANCING_OPTIONS.map((name) => {
                    const on = form.financingProviders.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          toggleInList("financingProviders", name)
                        }
                        className={`rounded-full border px-3 py-1 text-xs ${
                          on
                            ? "border-teal-700 bg-teal-700 text-white"
                            : "border-stone-300"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Field label="Financing notes">
                <textarea
                  value={form.financingInfo || ""}
                  onChange={(e) => update("financingInfo", e.target.value)}
                  rows={2}
                  className="field"
                />
              </Field>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.hasMembershipPlan}
                  onChange={(e) =>
                    update("hasMembershipPlan", e.target.checked)
                  }
                />
                We have a membership plan (creates /new-patients/membership)
              </label>
              {form.hasMembershipPlan && (
                <Field label="Membership plan details">
                  <textarea
                    value={form.membershipInfo || ""}
                    onChange={(e) => update("membershipInfo", e.target.value)}
                    rows={3}
                    className="field"
                  />
                </Field>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-2 text-sm text-stone-700">
              <p>
                <strong>{form.businessName || "—"}</strong> · {form.phone}
              </p>
              <p>
                Doctors:{" "}
                {form.doctors.filter((d) => d.name).map((d) => d.name).join(", ") ||
                  "—"}
              </p>
              <p>
                Team:{" "}
                {form.teamMembers
                  .filter((t) => t.name)
                  .map((t) => t.name)
                  .join(", ") || "—"}
              </p>
              <p>Services: {form.focusServices.join(", ")}</p>
              <p>
                Insurance: {form.insuranceAccepted ? "Yes" : "No"}
                {form.insuranceInNetwork ? " (in-network)" : ""} · Financing:{" "}
                {form.financingProviders.join(", ") || "—"}
                {form.hasMembershipPlan ? " · Membership page: Yes" : ""}
              </p>
              <ul className="list-disc pl-5 text-stone-500">
                <li>About Us + Meet Doctors + doctor profiles + Meet Team</li>
                <li>Services menu + each focus service page</li>
                <li>New Patients + Insurance + Financing (+ Membership)</li>
                <li>Contact Us + Blog index</li>
                <li>FAQ on every page · forms uploadable in CMS</li>
              </ul>
            </div>
          )}

          <ResultBlock error={error} result={result} />

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

      <style jsx global>{`
        .field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #d6d3d1;
          padding: 0.65rem 0.85rem;
          font-size: 0.875rem;
          outline: none;
        }
        .field:focus {
          box-shadow: 0 0 0 2px #0f766e55;
        }
      `}</style>
    </div>
  );
}

function ResultBlock({
  error,
  result,
}: {
  error: string | null;
  result: { name: string; pageCount: number } | null;
}) {
  return (
    <>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {result && (
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">
          Created <strong>{result.name}</strong> with {result.pageCount} pages.{" "}
          <a href="/agency/sites" className="underline">
            View sites
          </a>
        </p>
      )}
    </>
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
      {children}
    </label>
  );
}
