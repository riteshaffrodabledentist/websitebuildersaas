import { z } from "zod";

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
  open: z.string().optional(), // "09:00"
  close: z.string().optional(), // "17:00"
});

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
  businessHours: z.array(DayHoursSchema).default([]),
  insuranceAccepted: z.boolean().default(false),
  insuranceInfo: z.string().max(4000).optional().or(z.literal("")),
  financingInfo: z.string().max(4000).optional().or(z.literal("")),
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
    businessHours: DEFAULT_HOURS,
    insuranceAccepted: true,
    insuranceInfo: "",
    financingInfo: "",
    extraNotes: "",
  };
}
