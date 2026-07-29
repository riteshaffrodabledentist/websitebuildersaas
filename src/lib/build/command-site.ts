import { z } from "zod";

/**
 * Parse a natural-language "build a site" command into structured fields.
 * Full LLM parsing can replace this later; regex/heuristics bootstrap V1.
 */

export const BuildCommandSchema = z.object({
  practiceName: z.string().min(2),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  services: z.array(z.string()).default([]),
  bilingual: z.boolean().default(false),
  raw: z.string(),
});

export type BuildCommand = z.infer<typeof BuildCommandSchema>;

const SERVICE_KEYWORDS = [
  "implants",
  "invisalign",
  "braces",
  "whitening",
  "veneers",
  "crowns",
  "root canal",
  "emergency",
  "pediatric",
  "family dentistry",
  "cosmetic",
  "sedation",
  "dentures",
  "periodontics",
  "oral surgery",
];

export function parseBuildCommand(raw: string): BuildCommand {
  const text = raw.trim();
  const phoneMatch = text.match(
    /(?:phone|tel|call)?\s*:?\s*(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i,
  );
  const cityState = text.match(
    /(?:in|at|,)\s*([A-Za-z .'-]+?),\s*([A-Z]{2})\b/,
  );

  let practiceName = "New Dental Practice";
  const forMatch = text.match(
    /(?:for|called|named)\s+([A-Za-z0-9 &'.-]+?)(?:,|\s+in\s+|\s+phone|\s+with|\s*$)/i,
  );
  if (forMatch?.[1]) practiceName = forMatch[1].trim();

  const services = SERVICE_KEYWORDS.filter((k) =>
    text.toLowerCase().includes(k),
  ).map((k) => k.replace(/\b\w/g, (c) => c.toUpperCase()));

  const bilingual = /bilingual|spanish|español/i.test(text);

  return BuildCommandSchema.parse({
    practiceName,
    city: cityState?.[1]?.trim(),
    state: cityState?.[2]?.trim(),
    phone: phoneMatch?.[1]?.replace(/\s+/g, " ").trim(),
    services,
    bilingual,
    raw: text,
  });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

/** Default pages created by a command build */
export function commandSitePages(cmd: BuildCommand) {
  const servicePages = cmd.services.slice(0, 6).map((service) => ({
    title: service,
    slug: slugify(service),
    template: "SERVICE" as const,
    h1: `${service} in ${cmd.city ?? "Your Area"}`,
  }));

  return [
    {
      title: "Home",
      slug: "",
      template: "HOME" as const,
      h1: `Welcome to ${cmd.practiceName}`,
    },
    {
      title: "About",
      slug: "about",
      template: "ABOUT" as const,
      h1: `About ${cmd.practiceName}`,
    },
    ...servicePages,
    {
      title: "Location",
      slug: "location",
      template: "LOCATION" as const,
      h1: `Visit ${cmd.practiceName}`,
    },
    {
      title: "Contact",
      slug: "contact",
      template: "CONTACT" as const,
      h1: `Contact ${cmd.practiceName}`,
    },
  ];
}
