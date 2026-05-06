import type { BriefResponse } from "./briefSchema";

export type TemplateKey =
  | "ar_cashflow"
  | "sales_crm"
  | "inbox_triage"
  | "support_tier1"
  | "content_social"
  | "scheduling"
  | "hr_onboarding"
  | "data_entry"
  | "reporting"
  | "procurement"
  | "compliance"
  | "research"
  | "general";

export const TEMPLATE_KEYS: TemplateKey[] = [
  "ar_cashflow",
  "sales_crm",
  "inbox_triage",
  "support_tier1",
  "content_social",
  "scheduling",
  "hr_onboarding",
  "data_entry",
  "reporting",
  "procurement",
  "compliance",
  "research",
  "general"
];

export type Lang = "no" | "en";

type Library = Record<TemplateKey, Record<Lang, BriefResponse>>;

const TEMPLATES: Library = {
  ar_cashflow: {
    no: {
      agents: [
        { name: "AR-spesialist", color: "lime", tools: ["stripe", "tripletex", "gmail"] },
        { name: "Kundeservice", color: "blue", tools: ["gmail", "slack"] },
        { name: "Cashflow", color: "amber", tools: ["fiken"] }
      ],
      logs: [
        { agent: "AR-spesialist", action: "skrev 7 påminnelser", ts: "11:42" },
        { agent: "Kundeservice", action: "myket opp tonen i 2", ts: "11:43" },
        { agent: "Cashflow", action: "flagget 3 over 30d", ts: "11:44" }
      ],
      recommendation: {
        headline: "3 agenter, ~4t/uke spart.",
        ask: "Vil du ha dette satt opp på ekte for bedriften din?"
      }
    },
    en: {
      agents: [
        { name: "AR specialist", color: "lime", tools: ["stripe", "tripletex", "gmail"] },
        { name: "Customer voice", color: "blue", tools: ["gmail", "slack"] },
        { name: "Cashflow", color: "amber", tools: ["fiken"] }
      ],
      logs: [
        { agent: "AR specialist", action: "drafted 7 chase emails", ts: "11:42" },
        { agent: "Customer voice", action: "softened tone on 2", ts: "11:43" },
        { agent: "Cashflow", action: "flagged 3 invoices >30d", ts: "11:44" }
      ],
      recommendation: {
        headline: "3 agents, ~4h/wk saved.",
        ask: "Want this wired up for your company?"
      }
    }
  },
  sales_crm: {
    no: {
      agents: [
        { name: "SDR", color: "lime", tools: ["hubspot", "linkedin", "gmail"] },
        { name: "Researcher", color: "violet", tools: ["web", "linkedin"] },
        { name: "Closer", color: "amber", tools: ["calendly", "gmail"] }
      ],
      logs: [
        { agent: "Researcher", action: "fant 12 nye leads i Bergen", ts: "09:15" },
        { agent: "SDR", action: "sendte 12 personaliserte meldinger", ts: "09:22" },
        { agent: "Closer", action: "booket 2 møter neste uke", ts: "09:38" }
      ],
      recommendation: {
        headline: "3 agenter, +12 leads/uke.",
        ask: "Vil du teste dette på pipelinen din?"
      }
    },
    en: {
      agents: [
        { name: "SDR", color: "lime", tools: ["hubspot", "linkedin", "gmail"] },
        { name: "Researcher", color: "violet", tools: ["web", "linkedin"] },
        { name: "Closer", color: "amber", tools: ["calendly", "gmail"] }
      ],
      logs: [
        { agent: "Researcher", action: "found 12 new leads in Bergen", ts: "09:15" },
        { agent: "SDR", action: "sent 12 personalized messages", ts: "09:22" },
        { agent: "Closer", action: "booked 2 meetings next week", ts: "09:38" }
      ],
      recommendation: {
        headline: "3 agents, +12 leads/wk.",
        ask: "Want to try this on your pipeline?"
      }
    }
  },
  inbox_triage: {
    no: {
      agents: [
        { name: "Triager", color: "lime", tools: ["gmail", "notion"] },
        { name: "Planlegger", color: "blue", tools: ["calendar", "gmail"] }
      ],
      logs: [
        { agent: "Triager", action: "kategoriserte 84 e-poster", ts: "08:02" },
        { agent: "Triager", action: "svarte på 19 standardspørsmål", ts: "08:11" },
        { agent: "Planlegger", action: "booket 4 møter direkte", ts: "08:24" }
      ],
      recommendation: {
        headline: "Inboxen ned fra 200 til 12.",
        ask: "Vil du slippe denne fri på e-posten din?"
      }
    },
    en: {
      agents: [
        { name: "Triager", color: "lime", tools: ["gmail", "notion"] },
        { name: "Scheduler", color: "blue", tools: ["calendar", "gmail"] }
      ],
      logs: [
        { agent: "Triager", action: "categorized 84 emails", ts: "08:02" },
        { agent: "Triager", action: "answered 19 standard asks", ts: "08:11" },
        { agent: "Scheduler", action: "booked 4 meetings directly", ts: "08:24" }
      ],
      recommendation: {
        headline: "Inbox from 200 down to 12.",
        ask: "Want to point this at your inbox?"
      }
    }
  },
  support_tier1: {
    no: {
      agents: [
        { name: "Tier-1", color: "lime", tools: ["intercom", "notion", "gmail"] },
        { name: "Eskalering", color: "amber", tools: ["slack", "linear"] }
      ],
      logs: [
        { agent: "Tier-1", action: "lukket 23 saker selv", ts: "10:00" },
        { agent: "Tier-1", action: "skrev 5 nye FAQ-utkast", ts: "10:14" },
        { agent: "Eskalering", action: "ruta 3 til riktig person", ts: "10:25" }
      ],
      recommendation: {
        headline: "70% av tickets løst uten deg.",
        ask: "Skal vi koble dette på supporten din?"
      }
    },
    en: {
      agents: [
        { name: "Tier 1", color: "lime", tools: ["intercom", "notion", "gmail"] },
        { name: "Escalation", color: "amber", tools: ["slack", "linear"] }
      ],
      logs: [
        { agent: "Tier 1", action: "closed 23 tickets solo", ts: "10:00" },
        { agent: "Tier 1", action: "drafted 5 new FAQ entries", ts: "10:14" },
        { agent: "Escalation", action: "routed 3 to the right human", ts: "10:25" }
      ],
      recommendation: {
        headline: "70% of tickets solved without you.",
        ask: "Wire this into your support stack?"
      }
    }
  },
  content_social: {
    no: {
      agents: [
        { name: "Skribent", color: "lime", tools: ["notion", "openai", "linkedin"] },
        { name: "Designer", color: "violet", tools: ["figma", "canva"] },
        { name: "Planlegger", color: "blue", tools: ["buffer", "linkedin"] }
      ],
      logs: [
        { agent: "Skribent", action: "skrev 4 LinkedIn-poster", ts: "13:01" },
        { agent: "Designer", action: "lagde 4 bilder i merkevaren", ts: "13:18" },
        { agent: "Planlegger", action: "la dem i kø for uka", ts: "13:25" }
      ],
      recommendation: {
        headline: "Ukens innhold på 25 minutter.",
        ask: "Vil du ha dette på pilot?"
      }
    },
    en: {
      agents: [
        { name: "Writer", color: "lime", tools: ["notion", "openai", "linkedin"] },
        { name: "Designer", color: "violet", tools: ["figma", "canva"] },
        { name: "Scheduler", color: "blue", tools: ["buffer", "linkedin"] }
      ],
      logs: [
        { agent: "Writer", action: "drafted 4 LinkedIn posts", ts: "13:01" },
        { agent: "Designer", action: "made 4 on-brand images", ts: "13:18" },
        { agent: "Scheduler", action: "queued them for the week", ts: "13:25" }
      ],
      recommendation: {
        headline: "A week of content in 25 minutes.",
        ask: "Want a pilot of this?"
      }
    }
  },
  scheduling: {
    no: {
      agents: [
        { name: "Møtebooker", color: "lime", tools: ["calendar", "gmail"] },
        { name: "Forberedelse", color: "blue", tools: ["notion", "web"] }
      ],
      logs: [
        { agent: "Møtebooker", action: "fant 5 luker som passet alle", ts: "07:45" },
        { agent: "Forberedelse", action: "skrev brief til hvert møte", ts: "07:55" },
        { agent: "Møtebooker", action: "sendte invitasjoner med agenda", ts: "08:01" }
      ],
      recommendation: {
        headline: "Møter booket og forberedt før kaffe.",
        ask: "Skal vi sette dette opp for deg?"
      }
    },
    en: {
      agents: [
        { name: "Booker", color: "lime", tools: ["calendar", "gmail"] },
        { name: "Prep", color: "blue", tools: ["notion", "web"] }
      ],
      logs: [
        { agent: "Booker", action: "found 5 slots that worked for all", ts: "07:45" },
        { agent: "Prep", action: "wrote a brief for each meeting", ts: "07:55" },
        { agent: "Booker", action: "sent invites with agenda attached", ts: "08:01" }
      ],
      recommendation: {
        headline: "Meetings booked and prepped before coffee.",
        ask: "Want this set up for you?"
      }
    }
  },
  hr_onboarding: {
    no: {
      agents: [
        { name: "Onboarder", color: "lime", tools: ["notion", "gmail", "slack"] },
        { name: "Tilganger", color: "amber", tools: ["okta", "github"] }
      ],
      logs: [
        { agent: "Onboarder", action: "sendte velkomstpakke til 2 nye", ts: "09:00" },
        { agent: "Tilganger", action: "ga tilgang til 7 verktøy", ts: "09:12" },
        { agent: "Onboarder", action: "booket sjekk-inn etter 7 dager", ts: "09:14" }
      ],
      recommendation: {
        headline: "Ny ansatt klar dag 1.",
        ask: "Vil du standardisere dette?"
      }
    },
    en: {
      agents: [
        { name: "Onboarder", color: "lime", tools: ["notion", "gmail", "slack"] },
        { name: "Access", color: "amber", tools: ["okta", "github"] }
      ],
      logs: [
        { agent: "Onboarder", action: "sent welcome pack to 2 hires", ts: "09:00" },
        { agent: "Access", action: "granted access to 7 tools", ts: "09:12" },
        { agent: "Onboarder", action: "scheduled 7-day check-in", ts: "09:14" }
      ],
      recommendation: {
        headline: "New hire ready on day one.",
        ask: "Want to standardize this?"
      }
    }
  },
  data_entry: {
    no: {
      agents: [
        { name: "Innleser", color: "lime", tools: ["sheets", "ocr"] },
        { name: "Kvalitet", color: "blue", tools: ["sheets"] }
      ],
      logs: [
        { agent: "Innleser", action: "leste 142 kvitteringer", ts: "12:30" },
        { agent: "Kvalitet", action: "fant 4 avvik for sjekk", ts: "12:41" },
        { agent: "Innleser", action: "la alt inn i regnskapet", ts: "12:50" }
      ],
      recommendation: {
        headline: "Fra papirhaug til regnskap på 20 min.",
        ask: "Skal vi sette dette opp på papirene dine?"
      }
    },
    en: {
      agents: [
        { name: "Reader", color: "lime", tools: ["sheets", "ocr"] },
        { name: "QA", color: "blue", tools: ["sheets"] }
      ],
      logs: [
        { agent: "Reader", action: "parsed 142 receipts", ts: "12:30" },
        { agent: "QA", action: "flagged 4 anomalies", ts: "12:41" },
        { agent: "Reader", action: "posted all to bookkeeping", ts: "12:50" }
      ],
      recommendation: {
        headline: "Paper pile to books in 20 min.",
        ask: "Want this on your stack?"
      }
    }
  },
  reporting: {
    no: {
      agents: [
        { name: "Analytiker", color: "lime", tools: ["sheets", "metabase"] },
        { name: "Forfatter", color: "violet", tools: ["notion", "slack"] }
      ],
      logs: [
        { agent: "Analytiker", action: "hentet KPI-er fra 3 systemer", ts: "06:00" },
        { agent: "Forfatter", action: "skrev ukerapport på 1 side", ts: "06:08" },
        { agent: "Forfatter", action: "delte i lederkanalen", ts: "06:10" }
      ],
      recommendation: {
        headline: "Ukerapport på bordet kl 06.",
        ask: "Vil du ha den i innboksen mandag?"
      }
    },
    en: {
      agents: [
        { name: "Analyst", color: "lime", tools: ["sheets", "metabase"] },
        { name: "Writer", color: "violet", tools: ["notion", "slack"] }
      ],
      logs: [
        { agent: "Analyst", action: "pulled KPIs from 3 systems", ts: "06:00" },
        { agent: "Writer", action: "wrote 1-page weekly report", ts: "06:08" },
        { agent: "Writer", action: "posted in leadership channel", ts: "06:10" }
      ],
      recommendation: {
        headline: "Weekly report ready at 6 a.m.",
        ask: "Want it in your inbox Mondays?"
      }
    }
  },
  procurement: {
    no: {
      agents: [
        { name: "Innkjøper", color: "lime", tools: ["web", "gmail"] },
        { name: "Kontrakter", color: "amber", tools: ["notion", "docusign"] }
      ],
      logs: [
        { agent: "Innkjøper", action: "hentet 3 tilbud på samme spec", ts: "14:00" },
        { agent: "Kontrakter", action: "leste vilkårene for risiko", ts: "14:18" },
        { agent: "Innkjøper", action: "anbefalte den billigste", ts: "14:22" }
      ],
      recommendation: {
        headline: "Tilbud sammenlignet på minutter.",
        ask: "Vil du få dette i din innkjøpsflyt?"
      }
    },
    en: {
      agents: [
        { name: "Buyer", color: "lime", tools: ["web", "gmail"] },
        { name: "Contracts", color: "amber", tools: ["notion", "docusign"] }
      ],
      logs: [
        { agent: "Buyer", action: "got 3 quotes on same spec", ts: "14:00" },
        { agent: "Contracts", action: "scanned terms for risk", ts: "14:18" },
        { agent: "Buyer", action: "recommended cheapest one", ts: "14:22" }
      ],
      recommendation: {
        headline: "Quotes compared in minutes.",
        ask: "Want this in your procurement flow?"
      }
    }
  },
  compliance: {
    no: {
      agents: [
        { name: "Vakthund", color: "lime", tools: ["notion", "gmail"] },
        { name: "Loggfører", color: "blue", tools: ["sheets"] }
      ],
      logs: [
        { agent: "Vakthund", action: "sjekka 27 dokumenter mot policy", ts: "11:00" },
        { agent: "Vakthund", action: "fant 2 som mangler signatur", ts: "11:09" },
        { agent: "Loggfører", action: "registrerte revisjonssporet", ts: "11:11" }
      ],
      recommendation: {
        headline: "Compliance på autopilot.",
        ask: "Vil du teste på en av prosessene dine?"
      }
    },
    en: {
      agents: [
        { name: "Watchdog", color: "lime", tools: ["notion", "gmail"] },
        { name: "Logger", color: "blue", tools: ["sheets"] }
      ],
      logs: [
        { agent: "Watchdog", action: "checked 27 docs against policy", ts: "11:00" },
        { agent: "Watchdog", action: "found 2 missing signatures", ts: "11:09" },
        { agent: "Logger", action: "wrote the audit trail", ts: "11:11" }
      ],
      recommendation: {
        headline: "Compliance on autopilot.",
        ask: "Want to try this on one of your processes?"
      }
    }
  },
  research: {
    no: {
      agents: [
        { name: "Søker", color: "lime", tools: ["web", "scholar"] },
        { name: "Sammenfatter", color: "violet", tools: ["notion"] }
      ],
      logs: [
        { agent: "Søker", action: "leste 18 kilder på temaet", ts: "15:30" },
        { agent: "Sammenfatter", action: "skrev 2-siders brief med kilder", ts: "15:48" },
        { agent: "Sammenfatter", action: "delte i Notion-prosjekt", ts: "15:50" }
      ],
      recommendation: {
        headline: "Markedsbrief på 20 min.",
        ask: "Skal vi gjøre dette for ditt neste tema?"
      }
    },
    en: {
      agents: [
        { name: "Searcher", color: "lime", tools: ["web", "scholar"] },
        { name: "Synthesizer", color: "violet", tools: ["notion"] }
      ],
      logs: [
        { agent: "Searcher", action: "read 18 sources on the topic", ts: "15:30" },
        { agent: "Synthesizer", action: "wrote 2-page brief with citations", ts: "15:48" },
        { agent: "Synthesizer", action: "posted in Notion project", ts: "15:50" }
      ],
      recommendation: {
        headline: "Market brief in 20 min.",
        ask: "Want this for your next topic?"
      }
    }
  },
  general: {
    no: {
      agents: [
        { name: "Koordinator", color: "lime", tools: ["notion", "slack"] },
        { name: "Utfører", color: "blue", tools: ["gmail", "sheets"] },
        { name: "Sjekker", color: "amber", tools: ["notion"] }
      ],
      logs: [
        { agent: "Koordinator", action: "brøt ned oppgaven i 5 steg", ts: "09:00" },
        { agent: "Utfører", action: "kjørte de 4 første", ts: "09:18" },
        { agent: "Sjekker", action: "kvalitetssikret resultatet", ts: "09:25" }
      ],
      recommendation: {
        headline: "Et team som tar oppgaven.",
        ask: "Vil du beskrive utfordringen din litt mer?"
      }
    },
    en: {
      agents: [
        { name: "Coordinator", color: "lime", tools: ["notion", "slack"] },
        { name: "Executor", color: "blue", tools: ["gmail", "sheets"] },
        { name: "Reviewer", color: "amber", tools: ["notion"] }
      ],
      logs: [
        { agent: "Coordinator", action: "broke the task into 5 steps", ts: "09:00" },
        { agent: "Executor", action: "ran the first 4", ts: "09:18" },
        { agent: "Reviewer", action: "checked the output", ts: "09:25" }
      ],
      recommendation: {
        headline: "A team that takes the task.",
        ask: "Want to tell us a bit more about your challenge?"
      }
    }
  }
};

const KEYWORDS: Array<[TemplateKey, RegExp]> = [
  ["ar_cashflow", /\b(faktur\w*|invoice\w*|payment\w*|chase\w*|inkasso|purring|cash\s*flow|kontant\w*|sene?\b)/i],
  ["sales_crm", /\b(leads?|sales?|salg|crm|pipeline|prospect\w*|outreach|cold)\b/i],
  ["inbox_triage", /\b(e-post|epost|email|inbox|innboks)\b/i],
  ["support_tier1", /\b(support\w*|kundeservice|ticket\w*|sak|helpdesk|customer\s*service)\b/i],
  ["content_social", /\b(market\w*|markedsf\w*|content|innhold|social\w*|sosiale|post\w*|linkedin|instagram)\b/i],
  ["scheduling", /\b(møte\w*|meeting\w*|schedule\w*|book\w*|kalender|calendar|appointment\w*)\b/i],
  ["hr_onboarding", /\b(onboard\w*|hr|ansatt\w*|employee\w*|hire\w*|new\s+hire)\b/i],
  ["data_entry", /\b(data\s*entry|skriv\s+inn|punche\w*|kvittering\w*|receipt\w*|spreadsheet\w*|regneark)\b/i],
  ["reporting", /\b(rapport\w*|report\w*|kpi|dashboard\w*|metric\w*|måltall)\b/i],
  ["procurement", /\b(innkjøp\w*|procure\w*|tilbud\w*|quote\w*|leverandør\w*|vendor\w*|supplier\w*)\b/i],
  ["compliance", /\b(compliance|audit\w*|revisjon\w*|policy|gdpr|regulatory|samsvar)\b/i],
  ["research", /\b(research\w*|undersøk\w*|search\w*|finn\s+ut|kartlegg\w*|analyse\w*|analys\w*)\b/i]
];

export function pickTemplate(brief: string, _lang: Lang): TemplateKey {
  for (const [key, re] of KEYWORDS) {
    if (re.test(brief)) return key;
  }
  return "general";
}

export function getTemplate(key: TemplateKey, lang: Lang) {
  return TEMPLATES[key][lang];
}
