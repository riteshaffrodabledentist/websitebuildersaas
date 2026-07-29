import { PAGE_TEMPLATES, SECTION_CATALOG } from "@/lib/sections/catalog";
import type { SectionType } from "@/lib/sections/catalog";
import { parseBuildCommand, slugify } from "@/lib/build/command-site";
import {
  buildNavStructure,
  doctorSlug,
  type SiteQuestionnaire,
} from "@/lib/build/questionnaire";
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
  insuranceInNetwork?: boolean;
  insuranceInfo?: string;
  insuranceLogos?: string[];
  financingInfo?: string;
  financingProviders?: string[];
  hasMembershipPlan?: boolean;
  membershipInfo?: string;
  aboutContent?: string;
  newPatientWelcome?: string;
  patientForms?: SiteQuestionnaire["patientForms"];
  doctors?: SiteQuestionnaire["doctors"];
  teamMembers?: SiteQuestionnaire["teamMembers"];
  questionnaire?: SiteQuestionnaire;
};

type PageSpec = {
  title: string;
  slug: string;
  template:
    | "HOME"
    | "SERVICE"
    | "ABOUT"
    | "LOCATION"
    | "CONTACT"
    | "CUSTOM"
    | "DOCTORS"
    | "DOCTOR"
    | "TEAM"
    | "NEW_PATIENTS"
    | "INSURANCE"
    | "FINANCING"
    | "MEMBERSHIP"
    | "BLOG";
  h1: string;
  showInNav?: boolean;
  navOrder?: number;
  bodyOverride?: string;
};

function defaultFaqs(brief: SiteBrief, count: number) {
  const practiceName = brief.practiceName;
  const insuranceAnswer = brief.insuranceAccepted
    ? [
        brief.insuranceInNetwork
          ? "Yes — we are an in-network office for many plans."
          : "Yes — we work with many dental insurance plans.",
        brief.insuranceInfo?.trim(),
      ]
        .filter(Boolean)
        .join(" ")
    : "Call us and we will help you understand payment options.";

  const financingBits = [
    ...(brief.financingProviders || []),
    brief.financingInfo?.trim(),
  ].filter(Boolean);

  const seeds = [
    {
      question: `How do I book an appointment at ${practiceName}?`,
      answer: `Call ${brief.phone || "our office"} or use the contact form to schedule with ${practiceName}.`,
    },
    {
      question: "Do you accept dental insurance?",
      answer: insuranceAnswer,
    },
    {
      question: "What financing options do you offer?",
      answer: financingBits.length
        ? financingBits.join(" · ")
        : "Ask our team about flexible financing for treatment.",
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
      question: "What paperwork do new patients need?",
      answer:
        "Download new-patient forms from our New Patients page, or we can email them before your visit.",
    },
  ];
  return seeds.slice(0, Math.max(1, count)).map((f, i) => ({
    ...f,
    sortOrder: i,
  }));
}

function buildPageSpecs(brief: SiteBrief): {
  pages: PageSpec[];
  doctorRecords: { name: string; slug: string; credentials?: string; title?: string; bio?: string; sortOrder: number }[];
  teamRecords: { name: string; role?: string; bio?: string; sortOrder: number }[];
} {
  const doctors = (brief.doctors || [])
    .filter((d) => d.name.trim())
    .map((d, i) => ({
      name: d.name.trim(),
      slug: doctorSlug(d.name),
      credentials: d.credentials || undefined,
      title: d.title || undefined,
      bio: d.bio || undefined,
      sortOrder: i,
    }));

  // unique doctor slugs
  const seen = new Set<string>();
  for (const d of doctors) {
    let s = d.slug;
    let n = 2;
    while (seen.has(s)) {
      s = `${d.slug}-${n}`;
      n += 1;
    }
    seen.add(s);
    d.slug = s;
  }

  const teamRecords = (brief.teamMembers || [])
    .filter((t) => t.name.trim())
    .map((t, i) => ({
      name: t.name.trim(),
      role: t.role || undefined,
      bio: t.bio || undefined,
      sortOrder: i,
    }));

  const aboutBody =
    brief.aboutContent?.trim() ||
    `${brief.practiceName} is dedicated to comfortable, modern dentistry${
      brief.city ? ` in ${brief.city}` : ""
    }.${
      brief.googleBusinessName
        ? ` Find us on Google as “${brief.googleBusinessName}.”`
        : ""
    }`;

  const pages: PageSpec[] = [
    {
      title: "Home",
      slug: "",
      template: "HOME",
      h1: `Welcome to ${brief.practiceName}`,
      showInNav: true,
      navOrder: 0,
    },
    {
      title: "About Us",
      slug: "about",
      template: "ABOUT",
      h1: `About ${brief.practiceName}`,
      showInNav: true,
      navOrder: 1,
      bodyOverride: aboutBody,
    },
    {
      title: "Meet the Doctors",
      slug: "about/doctors",
      template: "DOCTORS",
      h1: "Meet the Doctors",
      showInNav: false,
      navOrder: 2,
    },
    ...doctors.map((d, i) => ({
      title: d.name,
      slug: `about/doctors/${d.slug}`,
      template: "DOCTOR" as const,
      h1: [d.name, d.credentials].filter(Boolean).join(", "),
      showInNav: false,
      navOrder: 3 + i,
      bodyOverride: d.bio || `${d.name} practices at ${brief.practiceName}.`,
    })),
    {
      title: "Meet the Team",
      slug: "about/team",
      template: "TEAM",
      h1: "Meet the Team",
      showInNav: false,
      navOrder: 40,
      bodyOverride:
        "Our skilled team supports every visit — bios and photos appear below. Team members do not have individual profile pages.",
    },
    {
      title: "Services",
      slug: "services",
      template: "CUSTOM",
      h1: `Dental Services at ${brief.practiceName}`,
      showInNav: true,
      navOrder: 50,
      bodyOverride: `Explore our focus services: ${brief.services.join(", ")}.`,
    },
    ...brief.services.slice(0, 12).map((service, i) => ({
      title: service,
      slug: `services/${slugify(service)}`,
      template: "SERVICE" as const,
      h1: `${service}${brief.city ? ` in ${brief.city}` : ""}`,
      showInNav: false,
      navOrder: 51 + i,
    })),
    {
      title: "New Patients",
      slug: "new-patients",
      template: "NEW_PATIENTS",
      h1: "New Patients",
      showInNav: true,
      navOrder: 70,
      bodyOverride:
        brief.newPatientWelcome?.trim() ||
        `Welcome to ${brief.practiceName}! Download paperwork below and review insurance & financing options.`,
    },
    {
      title: "Insurance",
      slug: "new-patients/insurance",
      template: "INSURANCE",
      h1: "Insurance",
      showInNav: false,
      navOrder: 71,
      bodyOverride: [
        brief.insuranceInNetwork
          ? "We are an in-network dental office for many major plans."
          : brief.insuranceAccepted
            ? "We work with many dental insurance plans."
            : "Contact us about payment options.",
        brief.insuranceInfo,
        brief.insuranceLogos?.length
          ? `Plans / logos: ${brief.insuranceLogos.join(", ")}.`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    {
      title: "Financing",
      slug: "new-patients/financing",
      template: "FINANCING",
      h1: "Financing Options",
      showInNav: false,
      navOrder: 72,
      bodyOverride: [
        brief.financingProviders?.length
          ? `We offer: ${brief.financingProviders.join(", ")}.`
          : "",
        brief.financingInfo,
      ]
        .filter(Boolean)
        .join("\n\n") || "Ask our team about flexible financing.",
    },
    ...(brief.hasMembershipPlan
      ? [
          {
            title: "Membership Plan",
            slug: "new-patients/membership",
            template: "MEMBERSHIP" as const,
            h1: "Membership Plan",
            showInNav: false,
            navOrder: 73,
            bodyOverride:
              brief.membershipInfo?.trim() ||
              `Ask ${brief.practiceName} about our in-house membership plan for patients without insurance.`,
          },
        ]
      : []),
    {
      title: "Contact Us",
      slug: "contact",
      template: "CONTACT",
      h1: `Contact ${brief.practiceName}`,
      showInNav: true,
      navOrder: 80,
      bodyOverride: `We’d love to hear from you. Call ${brief.phone || "us"} or send a message — our team typically responds during business hours.`,
    },
    {
      title: "Blog",
      slug: "blog",
      template: "BLOG",
      h1: "Dental Blog",
      showInNav: true,
      navOrder: 90,
      bodyOverride: `Tips and updates from ${brief.practiceName}. New posts can be added anytime in the client dashboard.`,
    },
  ];

  return { pages, doctorRecords: doctors, teamRecords };
}

function sectionBody(
  type: SectionType,
  brief: SiteBrief,
  page: PageSpec,
) {
  if (type === "hero") return page.bodyOverride?.split("\n\n")[0] || null;
  if (type === "about") return brief.aboutContent || page.bodyOverride || null;
  if (type === "content") return page.bodyOverride || null;
  if (type === "insurance") {
    return [
      brief.insuranceInNetwork ? "In-network office." : null,
      brief.insuranceInfo,
      brief.insuranceLogos?.length
        ? `Logos / plans: ${brief.insuranceLogos.join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join(" ");
  }
  if (type === "financing") {
    return [
      brief.financingProviders?.length
        ? `Providers: ${brief.financingProviders.join(", ")}`
        : null,
      brief.financingInfo,
    ]
      .filter(Boolean)
      .join(" ");
  }
  if (type === "doctors") {
    return "Select a doctor below to view their full profile.";
  }
  if (type === "team") {
    return "Meet the people who make your visit comfortable.";
  }
  if (type === "forms") {
    const count = brief.patientForms?.length ?? 0;
    return count
      ? `${count} form(s) available as PDF download or direct link. Clients can add more anytime in the CMS.`
      : "Add paperwork as a PDF upload or a direct link in the CMS. Forms appear here for patients.";
  }
  if (type === "services") {
    return brief.services.length
      ? `Focus services: ${brief.services.join(", ")}.`
      : null;
  }
  if (type === "cta") {
    return brief.phone
      ? `Call ${brief.phone} to schedule your visit.`
      : `Contact ${brief.practiceName} today.`;
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

  const { pages: pagesSpec, doctorRecords, teamRecords } =
    buildPageSpecs(brief);

  const navStructure = buildNavStructure({
    services: brief.services,
    hasMembership: Boolean(brief.hasMembershipPlan),
    doctors: doctorRecords.map((d) => ({ name: d.name, slug: d.slug })),
  });

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
      insuranceInNetwork: brief.insuranceInNetwork ?? false,
      insuranceInfo: brief.insuranceInfo || null,
      insuranceLogos: brief.insuranceLogos || [],
      financingInfo: brief.financingInfo || null,
      financingProviders: brief.financingProviders || [],
      hasMembershipPlan: brief.hasMembershipPlan ?? false,
      membershipInfo: brief.membershipInfo || null,
      aboutContent: brief.aboutContent || null,
      newPatientWelcome: brief.newPatientWelcome || null,
      questionnaire: brief.questionnaire ?? undefined,
      navStructure,
      llmsSummary: `${brief.practiceName} dental practice${
        brief.city ? ` in ${brief.city}` : ""
      }${brief.services.length ? ` offering ${brief.services.join(", ")}` : ""}.`,
      doctors: {
        create: doctorRecords.map((d) => ({
          name: d.name,
          slug: d.slug,
          credentials: d.credentials,
          title: d.title,
          bio: d.bio,
          sortOrder: d.sortOrder,
        })),
      },
      teamMembers: {
        create: teamRecords.map((t) => ({
          name: t.name,
          role: t.role,
          bio: t.bio,
          sortOrder: t.sortOrder,
        })),
      },
      patientForms: {
        create: (brief.patientForms || [])
          .filter((f) => f.title.trim() && f.url.trim())
          .map((f, i) => ({
            title: f.title.trim(),
            description: f.description || null,
            kind: f.kind,
            url: f.url.trim(),
            sortOrder: i,
          })),
      },
      pages: {
        create: pagesSpec.map((page) => {
          const template = PAGE_TEMPLATES[page.template];
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
                body: sectionBody(type, brief, page),
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
              { name: "Home", url: `https://${domainPlaceholder}/` },
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
              }.`.slice(0, 160),
            showInNav: page.showInNav ?? false,
            navOrder: page.navOrder ?? 0,
            schemaJson,
            sections: { create: sections },
            faqs: { create: faqs },
          };
        }),
      },
    },
    include: {
      pages: { include: { faqs: true, sections: true } },
      doctors: true,
      teamMembers: true,
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
      services: parsed.services.length
        ? parsed.services
        : ["General dentistry"],
      doctors: [{ name: "Dr. Smith", credentials: "DDS", title: "Dentist", bio: "" }],
      insuranceAccepted: true,
      insuranceInNetwork: true,
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
      insuranceInNetwork: a.insuranceInNetwork,
      insuranceInfo: a.insuranceInfo || undefined,
      insuranceLogos: a.insuranceLogos,
      financingInfo: a.financingInfo || undefined,
      financingProviders: a.financingProviders,
      hasMembershipPlan: a.hasMembershipPlan,
      membershipInfo: a.membershipInfo || undefined,
      aboutContent: a.aboutContent || undefined,
      newPatientWelcome: a.newPatientWelcome || undefined,
      patientForms: a.patientForms,
      doctors: a.doctors,
      teamMembers: a.teamMembers,
      questionnaire: a,
    },
  });
}
