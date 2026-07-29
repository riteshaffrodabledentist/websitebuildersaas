import { z } from "zod";
import { slugify } from "@/lib/build/command-site";

export const DayHoursSchema = z.object({
  day: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),
  closed: z.boolean().default(false),
  open: z.string().optional(),
  close: z.string().optional(),
});

export const DoctorInputSchema = z.object({
  name: z.string().min(2).max(120),
  credentials: z.string().max(80).optional().or(z.literal("")),
  title: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(8000).optional().or(z.literal("")),
});

export const TeamInputSchema = z.object({
  name: z.string().min(2).max(120),
  role: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(4000).optional().or(z.literal("")),
});

export const FINANCING_OPTIONS = [
  "CareCredit",
  "Sunbit",
  "Cherry",
  "In-house financing",
  "Charity / assistance programs",
] as const;

export const INSURANCE_LOGO_OPTIONS = [
  "Delta Dental",
  "Cigna",
  "Aetna",
  "MetLife",
  "Guardian",
  "United Healthcare",
  "Blue Cross Blue Shield",
  "Humana",
  "GEHA",
  "Medicaid",
] as const;

export const SiteQuestionnaireSchema = z.object({
  businessName: z.string().min(2).max(120),
  googleBusinessName: z.string().max(160).optional().or(z.literal("")),
  phone: z.string().min(7).max(40),
  email: z.string().email().optional().or(z.literal("")),
  addressLine1: z.string().max(160).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  state: z.string().max(40).optional().or(z.literal("")),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  country: z.string().max(40).default("US"),
  focusServices: z.array(z.string().min(1)).min(1).max(20),
  currentWebsiteUrl: z.string().url().optional().or(z.literal("")),
  inspirationWebsiteUrl: z.string().url().optional().or(z.literal("")),
  aboutContent: z.string().max(20000).optional().or(z.literal("")),
  fetchAboutFromCurrentSite: z.boolean().default(false),
  doctors: z.array(DoctorInputSchema).default([]),
  teamMembers: z.array(TeamInputSchema).default([]),
  newPatientWelcome: z.string().max(8000).optional().or(z.literal("")),
  businessHours: z.array(DayHoursSchema).default([]),
  insuranceAccepted: z.boolean().default(false),
  insuranceInNetwork: z.boolean().default(false),
  insuranceInfo: z.string().max(4000).optional().or(z.literal("")),
  insuranceLogos: z.array(z.string()).default([]),
  financingProviders: z.array(z.string()).default([]),
  financingInfo: z.string().max(4000).optional().or(z.literal("")),
  hasMembershipPlan: z.boolean().default(false),
  membershipInfo: z.string().max(4000).optional().or(z.literal("")),
  extraNotes: z.string().max(4000).optional().or(z.literal("")),
});

export type SiteQuestionnaire = z.infer<typeof SiteQuestionnaireSchema>;

export const SERVICE_OPTIONS = [
  "General dentistry",
  "Dental implants",
  "Invisalign",
  "Braces",
  "Teeth whitening",
  "Veneers",
  "Crowns & bridges",
  "Root canals",
  "Emergency dental",
  "Pediatric dentistry",
  "Cosmetic dentistry",
  "Sedation dentistry",
  "Dentures",
  "Periodontics",
  "Oral surgery",
  "Same-day crowns",
] as const;

export const DEFAULT_HOURS: SiteQuestionnaire["businessHours"] = [
  { day: "monday", closed: false, open: "09:00", close: "17:00" },
  { day: "tuesday", closed: false, open: "09:00", close: "17:00" },
  { day: "wednesday", closed: false, open: "09:00", close: "17:00" },
  { day: "thursday", closed: false, open: "09:00", close: "17:00" },
  { day: "friday", closed: false, open: "09:00", close: "16:00" },
  { day: "saturday", closed: true },
  { day: "sunday", closed: true },
];

export function emptyQuestionnaire(): SiteQuestionnaire {
  return {
    businessName: "",
    googleBusinessName: "",
    phone: "",
    email: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    focusServices: ["General dentistry"],
    currentWebsiteUrl: "",
    inspirationWebsiteUrl: "",
    aboutContent: "",
    fetchAboutFromCurrentSite: false,
    doctors: [{ name: "", credentials: "DDS", title: "Dentist", bio: "" }],
    teamMembers: [],
    newPatientWelcome:
      "Welcome to our practice! We’re excited to meet you. Complete your paperwork before your visit to save time at check-in.",
    businessHours: DEFAULT_HOURS,
    insuranceAccepted: true,
    insuranceInNetwork: true,
    insuranceInfo: "",
    insuranceLogos: [],
    financingProviders: [],
    financingInfo: "",
    hasMembershipPlan: false,
    membershipInfo: "",
    extraNotes: "",
  };
}

export function doctorSlug(name: string) {
  return slugify(name) || "doctor";
}

/** Top-level + nested nav for published sites */
export function buildNavStructure(input: {
  services: string[];
  hasMembership: boolean;
  doctors: { name: string; slug: string }[];
}) {
  return [
    { label: "Home", href: "/" },
    {
      label: "About Us",
      href: "/about",
      children: [
        { label: "Meet the Doctors", href: "/about/doctors" },
        { label: "Meet the Team", href: "/about/team" },
        ...input.doctors.map((d) => ({
          label: d.name,
          href: `/about/doctors/${d.slug}`,
        })),
      ],
    },
    {
      label: "Services",
      href: "/services",
      children: input.services.map((s) => ({
        label: s,
        href: `/services/${slugify(s)}`,
      })),
    },
    {
      label: "New Patients",
      href: "/new-patients",
      children: [
        { label: "Insurance", href: "/new-patients/insurance" },
        { label: "Financing", href: "/new-patients/financing" },
        ...(input.hasMembership
          ? [{ label: "Membership plan", href: "/new-patients/membership" }]
          : []),
      ],
    },
    { label: "Contact Us", href: "/contact" },
    { label: "Blog", href: "/blog" },
  ];
}
