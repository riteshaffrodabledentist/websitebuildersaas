/**
 * Site chrome: default header/footer are shared on every page.
 * Additional named variants can be created and assigned per page later.
 */

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export type HeaderConfig = {
  logoText: string;
  phone?: string;
  ctaLabel: string;
  ctaHref: string;
  nav: NavItem[];
  sticky: boolean;
};

export type FooterConfig = {
  practiceName: string;
  phone?: string;
  email?: string;
  addressLines: string[];
  nav: NavItem[];
  legalLinks: { label: string; href: string }[];
  copyright: string;
  showHours: boolean;
};

export function buildHeaderConfig(input: {
  practiceName: string;
  phone?: string;
  nav: NavItem[];
}): HeaderConfig {
  return {
    logoText: input.practiceName,
    phone: input.phone,
    ctaLabel: "Book appointment",
    ctaHref: "/contact",
    nav: input.nav,
    sticky: true,
  };
}

export function buildFooterConfig(input: {
  practiceName: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  nav: NavItem[];
}): FooterConfig {
  const addressLines = [
    input.addressLine1,
    [input.city, input.state, input.postalCode].filter(Boolean).join(", "),
  ].filter(Boolean) as string[];

  return {
    practiceName: input.practiceName,
    phone: input.phone,
    email: input.email,
    addressLines,
    nav: input.nav.filter((n) =>
      ["About Us", "Services", "New Patients", "Contact Us", "Blog"].includes(
        n.label,
      ),
    ),
    legalLinks: [
      { label: "Privacy", href: "/privacy" },
      { label: "Accessibility", href: "/accessibility" },
    ],
    copyright: `© ${new Date().getFullYear()} ${input.practiceName}. All rights reserved.`,
    showHours: true,
  };
}

/** Resolve which header/footer a page uses (override → site default). */
export function resolvePageChrome(input: {
  pageHeaderId?: string | null;
  pageFooterId?: string | null;
  chrome: { id: string; kind: "HEADER" | "FOOTER"; isDefault: boolean; config: unknown }[];
}) {
  const headers = input.chrome.filter((c) => c.kind === "HEADER");
  const footers = input.chrome.filter((c) => c.kind === "FOOTER");
  const defaultHeader = headers.find((c) => c.isDefault) ?? headers[0];
  const defaultFooter = footers.find((c) => c.isDefault) ?? footers[0];
  const header =
    headers.find((c) => c.id === input.pageHeaderId) ?? defaultHeader;
  const footer =
    footers.find((c) => c.id === input.pageFooterId) ?? defaultFooter;
  return { header, footer };
}
