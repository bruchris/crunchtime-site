// JSON-LD building blocks for crunchtime.no.
//
// Why: AI search engines (ChatGPT Search, Perplexity, Google AI Overviews,
// Claude) use schema.org to ground citations. Bare HTML works; structured
// data makes us quotable and disambiguates the brand from "Crunchtime"
// the restaurant SaaS / book / etc.

export const SITE_URL = "https://crunchtime.no";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const FOUNDER_ID = `${SITE_URL}/#founder`;

// Same-as links are how engines reconcile "Crunchtime" across the web.
// Add more as we publish them. Keep names consistent across these properties.
const SAME_AS = [
  "https://www.linkedin.com/company/crunchtime-no",
  "https://www.linkedin.com/in/christianbru",
  "https://github.com/crunchtime-no"
];

type Locale = "no" | "en";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Crunchtime",
    legalName: "Crunchtime AS",
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image`,
    image: `${SITE_URL}/opengraph-image`,
    description:
      "Norwegian AI agency in Bergen. We build agents that take repetitive work off your team's calendar — fixed price, live in under a month.",
    foundingDate: "2025",
    founder: { "@id": FOUNDER_ID },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bergen",
      addressCountry: "NO"
    },
    areaServed: [
      { "@type": "Country", name: "Norway" },
      { "@type": "Place", name: "Nordics" }
    ],
    knowsAbout: [
      "AI agents",
      "Agentic workflows",
      "Workflow automation",
      "AI implementation",
      "AI strategy",
      "LLM systems",
      "Tripletex automation",
      "Fiken automation",
      "Shopify automation"
    ],
    sameAs: SAME_AS,
    email: "hello@crunchtime.no"
  } as const;
}

export function founderSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: "Christian Bru",
    jobTitle: "Founder",
    worksFor: { "@id": ORG_ID },
    sameAs: ["https://www.linkedin.com/in/christianbru"]
  } as const;
}

export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "Crunchtime",
    inLanguage: locale === "no" ? "nb-NO" : "en-US",
    publisher: { "@id": ORG_ID }
  } as const;
}

export function breadcrumbSchema(
  trail: ReadonlyArray<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  } as const;
}

export function faqSchema(
  items: ReadonlyArray<{ q: string; a: string; url?: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a, url }) => ({
      "@type": "Question",
      name: q,
      ...(url ? { url } : {}),
      acceptedAnswer: { "@type": "Answer", text: a }
    }))
  } as const;
}

export function serviceSchema(args: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  price?: string;
  priceCurrency?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: args.name,
    description: args.description,
    serviceType: args.serviceType,
    url: args.url,
    provider: { "@id": ORG_ID },
    areaServed: [
      { "@type": "Country", name: "Norway" },
      { "@type": "Place", name: "Nordics" }
    ],
    ...(args.price
      ? {
          offers: {
            "@type": "Offer",
            price: args.price,
            priceCurrency: args.priceCurrency ?? "NOK",
            availability: "https://schema.org/InStock"
          }
        }
      : {})
  } as const;
}

export function contactPointSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    contactType: "sales",
    email: "hello@crunchtime.no",
    availableLanguage: ["nb-NO", "en-US"],
    areaServed: [
      { "@type": "Country", name: "Norway" },
      { "@type": "Place", name: "Nordics" }
    ]
  } as const;
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#localbusiness`,
    name: "Crunchtime",
    image: `${SITE_URL}/opengraph-image`,
    url: SITE_URL,
    telephone: undefined,
    priceRange: "12,000–90,000 NOK",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bergen",
      addressCountry: "NO"
    },
    areaServed: [
      { "@type": "Country", name: "Norway" },
      { "@type": "Place", name: "Nordics" }
    ]
  } as const;
}

export function articleSchema(args: {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: string | null;
  image: string | null;
  about: string[]; // verticals or topic tags — feeds schema.org `about`
  mentions?: string[]; // named tools / customers — feeds `mentions`
  inLanguage: "nb-NO" | "en-US";
  citations?: Array<{ url: string; name?: string; publisher?: string; datePublished?: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.headline,
    description: args.description,
    datePublished: args.datePublished,
    dateModified: args.dateModified,
    inLanguage: args.inLanguage,
    mainEntityOfPage: { "@type": "WebPage", "@id": args.url },
    author: args.author
      ? { "@type": "Person", name: args.author }
      : { "@id": FOUNDER_ID },
    publisher: { "@id": ORG_ID },
    ...(args.image ? { image: args.image } : {}),
    ...(args.about.length ? { about: args.about.map((name) => ({ "@type": "Thing", name })) } : {}),
    ...(args.mentions?.length
      ? { mentions: args.mentions.map((name) => ({ "@type": "Thing", name })) }
      : {}),
    // schema.org `citation` boosts credibility signals for AI engines that
    // prefer sourced content. We pass each cited source as a CreativeWork.
    ...(args.citations?.length
      ? {
          citation: args.citations.map((c) => ({
            "@type": "CreativeWork",
            url: c.url,
            ...(c.name ? { name: c.name } : {}),
            ...(c.publisher ? { publisher: { "@type": "Organization", name: c.publisher } } : {}),
            ...(c.datePublished ? { datePublished: c.datePublished } : {})
          }))
        }
      : {})
  } as const;
}

export function collectionPageSchema(args: {
  url: string;
  name: string;
  description: string;
  inLanguage: "nb-NO" | "en-US";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": args.url,
    url: args.url,
    name: args.name,
    description: args.description,
    inLanguage: args.inLanguage,
    isPartOf: { "@id": WEBSITE_ID }
  } as const;
}

// Inline JSON-LD <script> tag. Renders as type="application/ld+json".
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // schema.org data is fully controlled here; safe to inline
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
