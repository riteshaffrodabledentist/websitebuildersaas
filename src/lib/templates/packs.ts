/**
 * Five flagship visual packs + bespoke (client-approved Figma).
 * Header/footer chrome is defined once per pack and reused on every page.
 */

export type TemplatePackId =
  | "clinical-clean"
  | "warm-family"
  | "modern-minimal"
  | "bold-metro"
  | "soft-luxury"
  | "bespoke";

export type TemplateTokens = {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  fontDisplay: string;
  fontBody: string;
  radius: string;
};

export type TemplatePack = {
  id: TemplatePackId;
  name: string;
  description: string;
  mode: "FLAGSHIP" | "BESPOKE";
  /** High-fidelity bar: flagships aim near-pixel; bespoke follows client Figma */
  fidelity: "flagship" | "bespoke";
  tokens: TemplateTokens;
};

export const FLAGSHIP_PACKS: TemplatePack[] = [
  {
    id: "clinical-clean",
    name: "Clinical Clean",
    description: "Bright, precise, trust-forward — ideal for implants & specialty.",
    mode: "FLAGSHIP",
    fidelity: "flagship",
    tokens: {
      primary: "#0f766e",
      accent: "#134e4a",
      background: "#f8fafc",
      foreground: "#0f172a",
      muted: "#64748b",
      fontDisplay: "Fraunces",
      fontBody: "Outfit",
      radius: "12px",
    },
  },
  {
    id: "warm-family",
    name: "Warm Family",
    description: "Soft, welcoming tones for family and pediatric practices.",
    mode: "FLAGSHIP",
    fidelity: "flagship",
    tokens: {
      primary: "#b45309",
      accent: "#9a3412",
      background: "#fffbeb",
      foreground: "#1c1917",
      muted: "#78716c",
      fontDisplay: "Fraunces",
      fontBody: "Outfit",
      radius: "16px",
    },
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Lots of space, sharp type, quiet luxury.",
    mode: "FLAGSHIP",
    fidelity: "flagship",
    tokens: {
      primary: "#171717",
      accent: "#404040",
      background: "#fafafa",
      foreground: "#171717",
      muted: "#737373",
      fontDisplay: "Outfit",
      fontBody: "Outfit",
      radius: "8px",
    },
  },
  {
    id: "bold-metro",
    name: "Bold Metro",
    description: "High contrast, urban energy for multi-location brands.",
    mode: "FLAGSHIP",
    fidelity: "flagship",
    tokens: {
      primary: "#1d4ed8",
      accent: "#0f172a",
      background: "#f1f5f9",
      foreground: "#020617",
      muted: "#475569",
      fontDisplay: "Outfit",
      fontBody: "Outfit",
      radius: "4px",
    },
  },
  {
    id: "soft-luxury",
    name: "Soft Luxury",
    description: "Refined cosmetic feel — calm surfaces, elegant accents.",
    mode: "FLAGSHIP",
    fidelity: "flagship",
    tokens: {
      primary: "#6d28d9",
      accent: "#4c1d95",
      background: "#faf5ff",
      foreground: "#1e1b4b",
      muted: "#6b7280",
      fontDisplay: "Fraunces",
      fontBody: "Outfit",
      radius: "20px",
    },
  },
];

export function getTemplatePack(id?: string | null): TemplatePack {
  return (
    FLAGSHIP_PACKS.find((p) => p.id === id) ??
    FLAGSHIP_PACKS[0]
  );
}

export function bespokePackStub(name = "Client approved"): TemplatePack {
  return {
    id: "bespoke",
    name,
    description: "Built from client-approved Figma — site-specific chrome & sections.",
    mode: "BESPOKE",
    fidelity: "bespoke",
    tokens: FLAGSHIP_PACKS[0].tokens,
  };
}
