export type SeoCheck = {
  id: string;
  label: string;
  pass: boolean;
  required: boolean;
  hint?: string;
};

export type PageSeoInput = {
  h1?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  faqCount: number;
  missingAlts: number;
  hasGeoOnImages: boolean;
  hasSiteNap: boolean;
  contentQaPassed: boolean;
};

export function runPageSeoChecklist(input: PageSeoInput): SeoCheck[] {
  const titleLen = input.metaTitle?.trim().length ?? 0;
  const descLen = input.metaDescription?.trim().length ?? 0;

  return [
    {
      id: "h1",
      label: "Single H1 present",
      pass: Boolean(input.h1?.trim()),
      required: true,
    },
    {
      id: "title",
      label: "Meta title 30–60 chars",
      pass: titleLen >= 30 && titleLen <= 60,
      required: true,
      hint: titleLen ? `${titleLen} chars` : "Missing",
    },
    {
      id: "description",
      label: "Meta description 70–160 chars",
      pass: descLen >= 70 && descLen <= 160,
      required: true,
      hint: descLen ? `${descLen} chars` : "Missing",
    },
    {
      id: "faq",
      label: "FAQ items (≥1 required, ≥3 recommended)",
      pass: input.faqCount >= 1,
      required: true,
      hint: `${input.faqCount} items`,
    },
    {
      id: "alts",
      label: "All images have ALT text",
      pass: input.missingAlts === 0,
      required: true,
      hint: input.missingAlts ? `${input.missingAlts} missing` : undefined,
    },
    {
      id: "geo",
      label: "Images geotagged to practice address",
      pass: input.hasGeoOnImages || !input.hasSiteNap,
      required: false,
    },
    {
      id: "nap",
      label: "Practice NAP complete",
      pass: input.hasSiteNap,
      required: true,
    },
    {
      id: "content-qa",
      label: "Content QA passed (humanize → Copyleaks)",
      pass: input.contentQaPassed,
      required: true,
    },
  ];
}

export function canPublish(checks: SeoCheck[]): boolean {
  return checks.filter((c) => c.required).every((c) => c.pass);
}
