import { PAGE_TEMPLATES, SECTION_CATALOG } from "@/lib/sections/catalog";
import type { SectionType } from "@/lib/sections/catalog";
import {
  commandSitePages,
  parseBuildCommand,
  slugify,
} from "@/lib/build/command-site";
import { prisma } from "@/lib/db";
import {
  buildBreadcrumbSchema,
  buildDentistSchema,
  buildFaqPageSchema,
} from "@/lib/schema/builders";

function defaultFaqs(count: number, practiceName: string) {
  const seeds = [
    {
      question: `How do I book an appointment at ${practiceName}?`,
      answer: `Call our office or use the contact form on this website to schedule your visit with ${practiceName}.`,
    },
    {
      question: "Do you accept dental insurance?",
      answer:
        "We work with many major dental insurance plans. Contact us with your plan details and we will help verify benefits.",
    },
    {
      question: "Where is the practice located?",
      answer: `${practiceName} welcomes new patients. See our Location page for address, hours, and directions.`,
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

export async function createSiteFromCommand(input: {
  organizationId: string;
  command: string;
}) {
  const parsed = parseBuildCommand(input.command);
  const siteSlugBase = slugify(parsed.practiceName) || "practice";
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

  const pagesSpec = commandSitePages(parsed);

  const site = await prisma.site.create({
    data: {
      organizationId: input.organizationId,
      name: parsed.practiceName,
      slug: siteSlug,
      practiceName: parsed.practiceName,
      phone: parsed.phone,
      city: parsed.city,
      state: parsed.state,
      country: "US",
      llmsSummary: `${parsed.practiceName} dental practice${
        parsed.city ? ` in ${parsed.city}` : ""
      }${parsed.services.length ? ` offering ${parsed.services.join(", ")}` : ""}.`,
      pages: {
        create: pagesSpec.map((page, pageIndex) => {
          const templateKey = page.template;
          const template = PAGE_TEMPLATES[templateKey];
          const faqs = defaultFaqs(template.defaultFaqs, parsed.practiceName);
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
                body:
                  type === "hero"
                    ? `Welcome to ${parsed.practiceName}. Quality dental care${
                        parsed.city ? ` in ${parsed.city}` : ""
                      }.`
                    : null,
              };
            },
          );

          const domainPlaceholder = `${siteSlug}.example.com`;
          const path = page.slug ? `/${page.slug}` : "/";
          const schemaJson = [
            buildDentistSchema({
              practiceName: parsed.practiceName,
              phone: parsed.phone,
              city: parsed.city,
              state: parsed.state,
              country: "US",
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
            metaTitle: `${page.title} | ${parsed.practiceName}`.slice(0, 60),
            metaDescription:
              `${page.h1}. Visit ${parsed.practiceName}${
                parsed.city ? ` in ${parsed.city}` : ""
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
