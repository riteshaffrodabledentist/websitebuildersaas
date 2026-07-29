import { PAGE_TEMPLATES, SECTION_CATALOG } from "@/lib/sections/catalog";
import type { SectionType } from "@/lib/sections/catalog";
import {
  commandSitePages,
  parseBuildCommand,
  slugify,
} from "@/lib/build/command-site";
import type { BuildCommand } from "@/lib/build/command-site";
import type { SiteQuestionnaire } from "@/lib/build/questionnaire";
import { prisma } from "@/lib/db";
import {
  buildBreadcrumbSchema,
  buildDentistSchema,
  buildFaqPageSchema,
} from "@/lib/schema/builders";

export type SiteBrief = {
  practiceName: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  services: string[];
  googleBusinessName?: string;
  currentWebsiteUrl?: string;
  inspirationWebsiteUrl?: string;
  businessHours?: SiteQuestionnaire["businessHours"];
  insuranceAccepted?: boolean;
  insuranceInfo?: string;
  financingInfo?: string;
  questionnaire?: SiteQuestionnaire;
  bilingual?: boolean;
};

function defaultFaqs(brief: SiteBrief, count: number) {
  const practiceName = brief.practiceName;
  const insuranceAnswer = brief.insuranceAccepted
    ? brief.insuranceInfo?.trim() ||
      "Yes — we work with many major dental insurance plans. Contact us with your plan details and we will help verify benefits."
    : "We do not currently list accepted insurance plans online. Call us and we will help you understand payment options.";

  const financingAnswer =
    brief.financingInfo?.trim() ||
    "Ask our team about flexible financing and payment options for treatment.";

  const seeds = [
    {
      question: `How do I book an appointment at ${practiceName}?`,
      answer: `Call ${brief.phone || "our office"} or use the contact form on this website to schedule your visit with ${practiceName}.`,
    },
    {
      question: "Do you accept dental insurance?",
      answer: insuranceAnswer,
    },
    {
      question: "Do you offer financing?",
      answer: financingAnswer,
    },
    {
      question: "Where is the practice located?",
      answer: [
        practiceName,
        brief.addressLine1,
        [brief.city, brief.state, brief.postalCode].filter(Boolean).join(", "),
      ]
        .filter(Boolean)
        .join(" — "),
    },
    {
      question: "What should I bring to my first visit?",
      answer:
        "Please bring a photo ID, insurance card if applicable, and a list of current medications.",
    },
  ];
  return seeds.slice(0, Math.max(1, count)).map((f, i) => ({
    ...f,
    sortOrder: i,
  }));
}

function briefToCommand(brief: SiteBrief): BuildCommand {
  return {
    practiceName: brief.practiceName,
    city: brief.city,
    state: brief.state,
    phone: brief.phone,
    services: brief.services,
    bilingual: brief.bilingual ?? false,
    raw: `questionnaire:${brief.practiceName}`,
  };
}

function sectionBody(type: SectionType, brief: SiteBrief, h1: string) {
  if (type === "hero") {
    return `Welcome to ${brief.practiceName}. Quality dental care${
      brief.city ? ` in ${brief.city}` : ""
    }.`;
  }
  if (type === "insurance") {
    return brief.insuranceAccepted
      ? brief.insuranceInfo?.trim() ||
          "We accept many major dental insurance plans. Call us to verify your benefits."
      : "Contact us to learn about payment options for your care.";
  }
  if (type === "about") {
    const gbp = brief.googleBusinessName
      ? ` Find us on Google as “${brief.googleBusinessName}.”`
      : "";
    return `${brief.practiceName} is dedicated to comfortable, modern dentistry.${gbp}`;
  }
  if (type === "services") {
    return brief.services.length
      ? `Focus services: ${brief.services.join(", ")}.`
      : null;
  }
  if (type === "cta") {
    return brief.phone
      ? `Call ${brief.phone} to schedule your visit.`
      : `Contact ${brief.practiceName} to schedule your visit.`;
  }
  if (type === "content" && h1.toLowerCase().includes("financ")) {
    return brief.financingInfo || null;
  }
  return null;
}

export async function createSiteFromBrief(input: {
  organizationId: string;
  brief: SiteBrief;
}) {
  const { brief } = input;
  const siteSlugBase = slugify(brief.practiceName) || "practice";
  let siteSlug = siteSlugBase;
  let n = 0;
  while (
    await prisma.site.findUnique({
      where: {
        organizationId_slug: {
          organizationId: input.organizationId,
          slug: siteSlug,
        },
      },
    })
  ) {
    n += 1;
    siteSlug = `${siteSlugBase}-${n}`;
  }

  const pagesSpec: {
    title: string;
    slug: string;
    template: "HOME" | "SERVICE" | "ABOUT" | "LOCATION" | "CONTACT" | "CUSTOM";
    h1: string;
  }[] = commandSitePages(briefToCommand(brief));

  // Add insurance page content via HOME insurance section already in template;
  // if financing info exists, include a short custom page.
  if (brief.financingInfo?.trim()) {
    pagesSpec.splice(-2, 0, {
      title: "Financing",
      slug: "financing",
      template: "CUSTOM",
      h1: `Financing at ${brief.practiceName}`,
    });
  }

  const site = await prisma.site.create({
    data: {
      organizationId: input.organizationId,
      name: brief.practiceName,
      slug: siteSlug,
      practiceName: brief.practiceName,
      phone: brief.phone || null,
      email: brief.email || null,
      addressLine1: brief.addressLine1 || null,
      city: brief.city || null,
      state: brief.state || null,
      postalCode: brief.postalCode || null,
      country: brief.country || "US",
      googleBusinessName: brief.googleBusinessName || null,
      currentWebsiteUrl: brief.currentWebsiteUrl || null,
      inspirationWebsiteUrl: brief.inspirationWebsiteUrl || null,
      businessHours: brief.businessHours ?? undefined,
      focusServices: brief.services,
      insuranceAccepted: brief.insuranceAccepted ?? false,
      insuranceInfo: brief.insuranceInfo || null,
      financingInfo: brief.financingInfo || null,
      questionnaire: brief.questionnaire ?? undefined,
      llmsSummary: `${brief.practiceName} dental practice${
        brief.city ? ` in ${brief.city}` : ""
      }${brief.services.length ? ` offering ${brief.services.join(", ")}` : ""}.`,
      pages: {
        create: pagesSpec.map((page, pageIndex) => {
          const templateKey = page.template;
          const template = PAGE_TEMPLATES[templateKey];
          const faqs = defaultFaqs(brief, template.defaultFaqs);
          const sections = template.defaultSections.map(
            (type: SectionType, i: number) => {
              const def = SECTION_CATALOG[type];
              return {
                type,
                sortOrder: i,
                heading:
                  type === "hero"
                    ? page.h1
                    : def.label === "FAQ"
                      ? "Frequently asked questions"
                      : def.label,
                headingLevel: def.headingLevel,
                body: sectionBody(type, brief, page.h1),
              };
            },
          );

          const domainPlaceholder = `${siteSlug}.example.com`;
          const path = page.slug ? `/${page.slug}` : "/";
          const schemaJson = [
            buildDentistSchema({
              practiceName: brief.practiceName,
              phone: brief.phone,
              email: brief.email,
              addressLine1: brief.addressLine1,
              city: brief.city,
              state: brief.state,
              postalCode: brief.postalCode,
              country: brief.country || "US",
              domain: domainPlaceholder,
            }),
            buildFaqPageSchema(faqs),
            buildBreadcrumbSchema([
              {
                name: "Home",
                url: `https://${domainPlaceholder}/`,
              },
              ...(page.slug
                ? [
                    {
                      name: page.title,
                      url: `https://${domainPlaceholder}${path}`,
                    },
                  ]
                : []),
            ]),
          ];

          return {
            title: page.title,
            slug: page.slug,
            template: page.template,
            status: "DRAFT" as const,
            h1: page.h1,
            metaTitle: `${page.title} | ${brief.practiceName}`.slice(0, 60),
            metaDescription:
              `${page.h1}. Visit ${brief.practiceName}${
                brief.city ? ` in ${brief.city}` : ""
              } for expert dental care.`.slice(0, 160),
            showInNav: true,
            navOrder: pageIndex,
            schemaJson,
            sections: { create: sections },
            faqs: { create: faqs },
          };
        }),
      },
    },
    include: {
      pages: {
        include: { faqs: true, sections: true },
      },
    },
  });

  return site;
}

export async function createSiteFromCommand(input: {
  organizationId: string;
  command: string;
}) {
  const parsed = parseBuildCommand(input.command);
  return createSiteFromBrief({
    organizationId: input.organizationId,
    brief: {
      practiceName: parsed.practiceName,
      phone: parsed.phone,
      city: parsed.city,
      state: parsed.state,
      country: "US",
      services: parsed.services,
      bilingual: parsed.bilingual,
    },
  });
}

export async function createSiteFromQuestionnaire(input: {
  organizationId: string;
  answers: SiteQuestionnaire;
}) {
  const a = input.answers;
  return createSiteFromBrief({
    organizationId: input.organizationId,
    brief: {
      practiceName: a.businessName,
      phone: a.phone,
      email: a.email || undefined,
      addressLine1: a.addressLine1 || undefined,
      city: a.city || undefined,
      state: a.state || undefined,
      postalCode: a.postalCode || undefined,
      country: a.country || "US",
      services: a.focusServices,
      googleBusinessName: a.googleBusinessName || undefined,
      currentWebsiteUrl: a.currentWebsiteUrl || undefined,
      inspirationWebsiteUrl: a.inspirationWebsiteUrl || undefined,
      businessHours: a.businessHours,
      insuranceAccepted: a.insuranceAccepted,
      insuranceInfo: a.insuranceInfo || undefined,
      financingInfo: a.financingInfo || undefined,
      questionnaire: a,
    },
  });
}
