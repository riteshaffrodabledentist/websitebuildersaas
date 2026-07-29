export type SiteNap = {
  practiceName?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  geoLat?: number | null;
  geoLng?: number | null;
  email?: string | null;
  domain?: string | null;
};

export type FaqPair = { question: string; answer: string };

export function buildDentistSchema(site: SiteNap) {
  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: site.practiceName ?? undefined,
    telephone: site.phone ?? undefined,
    email: site.email ?? undefined,
    url: site.domain ? `https://${site.domain}` : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.addressLine1 ?? undefined,
      addressLocality: site.city ?? undefined,
      addressRegion: site.state ?? undefined,
      postalCode: site.postalCode ?? undefined,
      addressCountry: site.country ?? "US",
    },
    geo:
      site.geoLat != null && site.geoLng != null
        ? {
            "@type": "GeoCoordinates",
            latitude: site.geoLat,
            longitude: site.geoLng,
          }
        : undefined,
  };
}

export function buildFaqPageSchema(faqs: FaqPair[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildBlogPostingSchema(input: {
  title: string;
  description?: string | null;
  url: string;
  datePublished?: string | null;
  authorName?: string | null;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description ?? undefined,
    url: input.url,
    datePublished: input.datePublished ?? undefined,
    author: input.authorName
      ? { "@type": "Person", name: input.authorName }
      : undefined,
    image: input.image ?? undefined,
  };
}
