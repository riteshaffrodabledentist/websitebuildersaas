/**
 * Dental section catalog — heading levels are locked; editors change text only.
 */

export type SectionType =
  | "hero"
  | "services"
  | "about"
  | "insurance"
  | "location"
  | "cta"
  | "faq"
  | "content";

export type SectionDefinition = {
  type: SectionType;
  label: string;
  headingLevel: 1 | 2 | 3;
  description: string;
  allowsBody: boolean;
};

export const SECTION_CATALOG: Record<SectionType, SectionDefinition> = {
  hero: {
    type: "hero",
    label: "Hero",
    headingLevel: 1,
    description: "Owns the page H1 — only one per page",
    allowsBody: true,
  },
  services: {
    type: "services",
    label: "Services",
    headingLevel: 2,
    description: "Service grid with H2 title and H3 items",
    allowsBody: true,
  },
  about: {
    type: "about",
    label: "About",
    headingLevel: 2,
    description: "Practice story",
    allowsBody: true,
  },
  insurance: {
    type: "insurance",
    label: "Insurance",
    headingLevel: 2,
    description: "Plans accepted",
    allowsBody: true,
  },
  location: {
    type: "location",
    label: "Location",
    headingLevel: 2,
    description: "Map and NAP",
    allowsBody: true,
  },
  cta: {
    type: "cta",
    label: "Call to action",
    headingLevel: 2,
    description: "Book / call prompt",
    allowsBody: true,
  },
  faq: {
    type: "faq",
    label: "FAQ",
    headingLevel: 2,
    description: "Mandatory on every page — drives FAQPage schema",
    allowsBody: false,
  },
  content: {
    type: "content",
    label: "Content",
    headingLevel: 2,
    description: "Generic rich content block",
    allowsBody: true,
  },
};

export const PAGE_TEMPLATES: Record<
  string,
  { label: string; defaultSections: SectionType[]; defaultFaqs: number }
> = {
  HOME: {
    label: "Home",
    defaultSections: ["hero", "services", "about", "cta", "faq"],
    defaultFaqs: 3,
  },
  SERVICE: {
    label: "Service",
    defaultSections: ["hero", "content", "cta", "faq"],
    defaultFaqs: 4,
  },
  ABOUT: {
    label: "About",
    defaultSections: ["hero", "about", "cta", "faq"],
    defaultFaqs: 3,
  },
  LOCATION: {
    label: "Location",
    defaultSections: ["hero", "location", "cta", "faq"],
    defaultFaqs: 3,
  },
  CONTACT: {
    label: "Contact",
    defaultSections: ["hero", "location", "cta", "faq"],
    defaultFaqs: 3,
  },
  CUSTOM: {
    label: "Custom",
    defaultSections: ["hero", "content", "faq"],
    defaultFaqs: 3,
  },
};

export function lockedHeadingLevel(type: SectionType): 1 | 2 | 3 {
  return SECTION_CATALOG[type].headingLevel;
}
