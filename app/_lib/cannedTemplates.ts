import type { BriefResponse, Lang } from "./briefSchema";

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
        { agent: "AR-spesialist", action: "hentet 23 åpne fakturaer fra Tripletex", ts: "11:41", type: "automation", tokens: 2400 },
        { agent: "Cashflow", action: "rangerte etter beløp og forfall, valgte ut 8", ts: "11:42", type: "automation", tokens: 1800 },
        { agent: "AR-spesialist", action: "skrev 7 påminnelser, 1 trenger manuell godkjenning", ts: "11:43", type: "assignment", tokens: 5300 },
        { agent: "Cashflow", action: "flagget 3 fakturaer over 30 dager til oppfølging", ts: "11:44", type: "issue", tokens: 1100 },
        { agent: "Kundeservice", action: "myket opp tonen i 2 utkast for å beholde relasjon", ts: "11:45", type: "automation", tokens: 3200 },
        { agent: "AR-spesialist", action: "sendte 6 påminnelser, lagret 1 i utkast", ts: "11:46", type: "assignment", tokens: 4100 },
        { agent: "Cashflow", action: "oppdaterte cashflow-prognose med forventet innkommende", ts: "11:47", type: "automation", tokens: 2700 }
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
        { agent: "AR specialist", action: "pulled 23 open invoices from Tripletex", ts: "11:41", type: "automation", tokens: 2400 },
        { agent: "Cashflow", action: "ranked by amount and due date, picked 8 to chase", ts: "11:42", type: "automation", tokens: 1800 },
        { agent: "AR specialist", action: "drafted 7 chase emails, 1 needs human review", ts: "11:43", type: "assignment", tokens: 5300 },
        { agent: "Cashflow", action: "flagged 3 invoices >30d for escalation", ts: "11:44", type: "issue", tokens: 1100 },
        { agent: "Customer voice", action: "softened tone on 2 drafts to protect the relationship", ts: "11:45", type: "automation", tokens: 3200 },
        { agent: "AR specialist", action: "sent 6 reminders, kept 1 in drafts", ts: "11:46", type: "assignment", tokens: 4100 },
        { agent: "Cashflow", action: "updated cash-flow forecast with expected incoming", ts: "11:47", type: "automation", tokens: 2700 }
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
        { agent: "Researcher", action: "fant 12 nye leads i Bergen som matcher ICP", ts: "09:15", type: "automation", tokens: 3100 },
        { agent: "Researcher", action: "beriket med stillingstittel og siste post", ts: "09:18", type: "automation", tokens: 2200 },
        { agent: "SDR", action: "skrev 12 personaliserte meldinger", ts: "09:22", type: "assignment", tokens: 4800 },
        { agent: "SDR", action: "flagget 1 lead som tidligere kunde", ts: "09:24", type: "issue", tokens: 900 },
        { agent: "SDR", action: "sendte 11, holdt 1 til manuell sjekk", ts: "09:30", type: "assignment", tokens: 2100 },
        { agent: "Closer", action: "fulgte opp 3 svar samme dag", ts: "09:35", type: "automation", tokens: 1900 },
        { agent: "Closer", action: "booket 2 møter neste uke", ts: "09:38", type: "assignment", tokens: 1400 }
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
        { agent: "Researcher", action: "found 12 new leads in Bergen matching ICP", ts: "09:15", type: "automation", tokens: 3100 },
        { agent: "Researcher", action: "enriched with title and last post", ts: "09:18", type: "automation", tokens: 2200 },
        { agent: "SDR", action: "drafted 12 personalized messages", ts: "09:22", type: "assignment", tokens: 4800 },
        { agent: "SDR", action: "flagged 1 lead as former customer", ts: "09:24", type: "issue", tokens: 900 },
        { agent: "SDR", action: "sent 11, held 1 for manual review", ts: "09:30", type: "assignment", tokens: 2100 },
        { agent: "Closer", action: "followed up on 3 same-day replies", ts: "09:35", type: "automation", tokens: 1900 },
        { agent: "Closer", action: "booked 2 meetings next week", ts: "09:38", type: "assignment", tokens: 1400 }
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
        { agent: "Triager", action: "kategoriserte 84 e-poster på 12 sek", ts: "08:02", type: "automation", tokens: 4600 },
        { agent: "Triager", action: "fant 6 høyt-prioritet som måtte sees nå", ts: "08:04", type: "issue", tokens: 1300 },
        { agent: "Triager", action: "svarte på 19 standardspørsmål", ts: "08:11", type: "assignment", tokens: 5200 },
        { agent: "Triager", action: "arkiverte 41 nyhetsbrev", ts: "08:14", type: "automation", tokens: 800 },
        { agent: "Planlegger", action: "fant ledige tider for 4 møteforespørsler", ts: "08:20", type: "automation", tokens: 1700 },
        { agent: "Planlegger", action: "booket 4 møter direkte", ts: "08:24", type: "assignment", tokens: 2400 },
        { agent: "Triager", action: "samlet 12 i en daglig oppsummering", ts: "08:28", type: "automation", tokens: 1500 }
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
        { agent: "Triager", action: "categorized 84 emails in 12 sec", ts: "08:02", type: "automation", tokens: 4600 },
        { agent: "Triager", action: "found 6 high-priority needing eyes now", ts: "08:04", type: "issue", tokens: 1300 },
        { agent: "Triager", action: "answered 19 standard asks", ts: "08:11", type: "assignment", tokens: 5200 },
        { agent: "Triager", action: "archived 41 newsletters", ts: "08:14", type: "automation", tokens: 800 },
        { agent: "Scheduler", action: "found open slots for 4 meeting requests", ts: "08:20", type: "automation", tokens: 1700 },
        { agent: "Scheduler", action: "booked 4 meetings directly", ts: "08:24", type: "assignment", tokens: 2400 },
        { agent: "Triager", action: "rolled 12 into a daily digest", ts: "08:28", type: "automation", tokens: 1500 }
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
        { agent: "Tier-1", action: "leste 33 nye saker fra Intercom", ts: "09:55", type: "automation", tokens: 2900 },
        { agent: "Tier-1", action: "lukket 23 saker selv", ts: "10:00", type: "assignment", tokens: 6100 },
        { agent: "Tier-1", action: "skrev 5 nye FAQ-utkast", ts: "10:14", type: "assignment", tokens: 4200 },
        { agent: "Eskalering", action: "fant 3 saker som trengte ingeniør", ts: "10:21", type: "issue", tokens: 1300 },
        { agent: "Eskalering", action: "ruta 3 til riktig person", ts: "10:25", type: "assignment", tokens: 1100 },
        { agent: "Tier-1", action: "fulgte opp 2 ventende kunder", ts: "10:30", type: "automation", tokens: 1700 }
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
        { agent: "Tier 1", action: "read 33 fresh tickets in Intercom", ts: "09:55", type: "automation", tokens: 2900 },
        { agent: "Tier 1", action: "closed 23 tickets solo", ts: "10:00", type: "assignment", tokens: 6100 },
        { agent: "Tier 1", action: "drafted 5 new FAQ entries", ts: "10:14", type: "assignment", tokens: 4200 },
        { agent: "Escalation", action: "spotted 3 tickets needing an engineer", ts: "10:21", type: "issue", tokens: 1300 },
        { agent: "Escalation", action: "routed 3 to the right human", ts: "10:25", type: "assignment", tokens: 1100 },
        { agent: "Tier 1", action: "nudged 2 waiting customers", ts: "10:30", type: "automation", tokens: 1700 }
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
        { agent: "Skribent", action: "leste 4 trender fra forrige uke", ts: "12:55", type: "automation", tokens: 2700 },
        { agent: "Skribent", action: "skrev 4 LinkedIn-poster", ts: "13:01", type: "assignment", tokens: 5400 },
        { agent: "Designer", action: "lagde 4 bilder i merkevaren", ts: "13:18", type: "assignment", tokens: 3300 },
        { agent: "Designer", action: "merket 1 som mangler logo-clearance", ts: "13:20", type: "issue", tokens: 600 },
        { agent: "Planlegger", action: "valgte beste publiseringstider", ts: "13:23", type: "automation", tokens: 1100 },
        { agent: "Planlegger", action: "la dem i kø for uka", ts: "13:25", type: "assignment", tokens: 900 }
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
        { agent: "Writer", action: "scanned 4 trends from last week", ts: "12:55", type: "automation", tokens: 2700 },
        { agent: "Writer", action: "drafted 4 LinkedIn posts", ts: "13:01", type: "assignment", tokens: 5400 },
        { agent: "Designer", action: "made 4 on-brand images", ts: "13:18", type: "assignment", tokens: 3300 },
        { agent: "Designer", action: "flagged 1 missing logo clearance", ts: "13:20", type: "issue", tokens: 600 },
        { agent: "Scheduler", action: "picked best post-times per audience", ts: "13:23", type: "automation", tokens: 1100 },
        { agent: "Scheduler", action: "queued them for the week", ts: "13:25", type: "assignment", tokens: 900 }
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
        { agent: "Møtebooker", action: "leste 8 møteforespørsler fra inboksen", ts: "07:40", type: "automation", tokens: 1900 },
        { agent: "Møtebooker", action: "fant 5 luker som passet alle", ts: "07:45", type: "automation", tokens: 1300 },
        { agent: "Møtebooker", action: "fant 1 konflikt med privat tid", ts: "07:48", type: "issue", tokens: 500 },
        { agent: "Forberedelse", action: "skrev brief til hvert møte", ts: "07:55", type: "assignment", tokens: 4800 },
        { agent: "Forberedelse", action: "samlet relevante notater fra Notion", ts: "07:58", type: "automation", tokens: 1700 },
        { agent: "Møtebooker", action: "sendte invitasjoner med agenda", ts: "08:01", type: "assignment", tokens: 1400 }
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
        { agent: "Booker", action: "read 8 meeting requests from inbox", ts: "07:40", type: "automation", tokens: 1900 },
        { agent: "Booker", action: "found 5 slots that worked for all", ts: "07:45", type: "automation", tokens: 1300 },
        { agent: "Booker", action: "spotted 1 clash with personal time", ts: "07:48", type: "issue", tokens: 500 },
        { agent: "Prep", action: "wrote a brief for each meeting", ts: "07:55", type: "assignment", tokens: 4800 },
        { agent: "Prep", action: "pulled relevant notes from Notion", ts: "07:58", type: "automation", tokens: 1700 },
        { agent: "Booker", action: "sent invites with agenda attached", ts: "08:01", type: "assignment", tokens: 1400 }
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
        { agent: "Onboarder", action: "hentet 2 nye ansatte fra HR-systemet", ts: "08:55", type: "automation", tokens: 1100 },
        { agent: "Onboarder", action: "sendte velkomstpakke til 2 nye", ts: "09:00", type: "assignment", tokens: 3200 },
        { agent: "Tilganger", action: "ga tilgang til 7 verktøy", ts: "09:12", type: "assignment", tokens: 2400 },
        { agent: "Tilganger", action: "1 verktøy krevde manuell godkjenning", ts: "09:13", type: "issue", tokens: 700 },
        { agent: "Onboarder", action: "booket sjekk-inn etter 7 dager", ts: "09:14", type: "assignment", tokens: 900 },
        { agent: "Onboarder", action: "tildelte mentor og introduksjons-økt", ts: "09:16", type: "automation", tokens: 1500 }
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
        { agent: "Onboarder", action: "pulled 2 new hires from HRIS", ts: "08:55", type: "automation", tokens: 1100 },
        { agent: "Onboarder", action: "sent welcome pack to 2 hires", ts: "09:00", type: "assignment", tokens: 3200 },
        { agent: "Access", action: "granted access to 7 tools", ts: "09:12", type: "assignment", tokens: 2400 },
        { agent: "Access", action: "1 tool needed manual approval", ts: "09:13", type: "issue", tokens: 700 },
        { agent: "Onboarder", action: "scheduled 7-day check-in", ts: "09:14", type: "assignment", tokens: 900 },
        { agent: "Onboarder", action: "assigned mentor and intro session", ts: "09:16", type: "automation", tokens: 1500 }
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
        { agent: "Innleser", action: "lastet opp 142 kvitteringer i bunken", ts: "12:25", type: "automation", tokens: 1300 },
        { agent: "Innleser", action: "leste 142 kvitteringer", ts: "12:30", type: "automation", tokens: 5800 },
        { agent: "Innleser", action: "matchet leverandører mot kontoplan", ts: "12:36", type: "automation", tokens: 2400 },
        { agent: "Kvalitet", action: "fant 4 avvik for sjekk", ts: "12:41", type: "issue", tokens: 1600 },
        { agent: "Kvalitet", action: "godkjente resten automatisk", ts: "12:46", type: "automation", tokens: 1100 },
        { agent: "Innleser", action: "la alt inn i regnskapet", ts: "12:50", type: "assignment", tokens: 2300 }
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
        { agent: "Reader", action: "uploaded 142 receipts in batch", ts: "12:25", type: "automation", tokens: 1300 },
        { agent: "Reader", action: "parsed 142 receipts", ts: "12:30", type: "automation", tokens: 5800 },
        { agent: "Reader", action: "matched vendors to chart of accounts", ts: "12:36", type: "automation", tokens: 2400 },
        { agent: "QA", action: "flagged 4 anomalies", ts: "12:41", type: "issue", tokens: 1600 },
        { agent: "QA", action: "approved the rest automatically", ts: "12:46", type: "automation", tokens: 1100 },
        { agent: "Reader", action: "posted all to bookkeeping", ts: "12:50", type: "assignment", tokens: 2300 }
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
        { agent: "Analytiker", action: "hentet KPI-er fra 3 systemer", ts: "06:00", type: "automation", tokens: 3600 },
        { agent: "Analytiker", action: "sammenliknet med forrige uke", ts: "06:03", type: "automation", tokens: 1800 },
        { agent: "Analytiker", action: "flagget 2 KPI-er utenfor mål", ts: "06:05", type: "issue", tokens: 800 },
        { agent: "Forfatter", action: "skrev ukerapport på 1 side", ts: "06:08", type: "assignment", tokens: 4400 },
        { agent: "Forfatter", action: "delte i lederkanalen", ts: "06:10", type: "assignment", tokens: 700 },
        { agent: "Forfatter", action: "lagret arkivversjon i Notion", ts: "06:11", type: "automation", tokens: 1200 }
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
        { agent: "Analyst", action: "pulled KPIs from 3 systems", ts: "06:00", type: "automation", tokens: 3600 },
        { agent: "Analyst", action: "compared to last week", ts: "06:03", type: "automation", tokens: 1800 },
        { agent: "Analyst", action: "flagged 2 KPIs off target", ts: "06:05", type: "issue", tokens: 800 },
        { agent: "Writer", action: "wrote 1-page weekly report", ts: "06:08", type: "assignment", tokens: 4400 },
        { agent: "Writer", action: "posted in leadership channel", ts: "06:10", type: "assignment", tokens: 700 },
        { agent: "Writer", action: "archived a copy in Notion", ts: "06:11", type: "automation", tokens: 1200 }
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
        { agent: "Innkjøper", action: "leste spec-en og fant 6 kandidater", ts: "13:55", type: "automation", tokens: 2900 },
        { agent: "Innkjøper", action: "hentet 3 tilbud på samme spec", ts: "14:00", type: "assignment", tokens: 3700 },
        { agent: "Kontrakter", action: "leste vilkårene for risiko", ts: "14:18", type: "automation", tokens: 4500 },
        { agent: "Kontrakter", action: "fant 1 leverandør med rød auto-fornying", ts: "14:20", type: "issue", tokens: 800 },
        { agent: "Innkjøper", action: "anbefalte den billigste", ts: "14:22", type: "assignment", tokens: 1600 },
        { agent: "Kontrakter", action: "forberedte signering i DocuSign", ts: "14:25", type: "automation", tokens: 1100 }
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
        { agent: "Buyer", action: "read the spec, shortlisted 6 candidates", ts: "13:55", type: "automation", tokens: 2900 },
        { agent: "Buyer", action: "got 3 quotes on same spec", ts: "14:00", type: "assignment", tokens: 3700 },
        { agent: "Contracts", action: "scanned terms for risk", ts: "14:18", type: "automation", tokens: 4500 },
        { agent: "Contracts", action: "flagged 1 vendor with red auto-renew", ts: "14:20", type: "issue", tokens: 800 },
        { agent: "Buyer", action: "recommended cheapest one", ts: "14:22", type: "assignment", tokens: 1600 },
        { agent: "Contracts", action: "prepped signing pack in DocuSign", ts: "14:25", type: "automation", tokens: 1100 }
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
        { agent: "Vakthund", action: "lastet inn gjeldende policy fra Notion", ts: "10:55", type: "automation", tokens: 1700 },
        { agent: "Vakthund", action: "sjekka 27 dokumenter mot policy", ts: "11:00", type: "automation", tokens: 5200 },
        { agent: "Vakthund", action: "fant 2 som mangler signatur", ts: "11:09", type: "issue", tokens: 900 },
        { agent: "Vakthund", action: "skrev påminnelse til de 2 ansvarlige", ts: "11:10", type: "assignment", tokens: 1500 },
        { agent: "Loggfører", action: "registrerte revisjonssporet", ts: "11:11", type: "assignment", tokens: 2100 },
        { agent: "Loggfører", action: "oppdaterte status-dashbordet", ts: "11:12", type: "automation", tokens: 1100 }
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
        { agent: "Watchdog", action: "loaded active policy from Notion", ts: "10:55", type: "automation", tokens: 1700 },
        { agent: "Watchdog", action: "checked 27 docs against policy", ts: "11:00", type: "automation", tokens: 5200 },
        { agent: "Watchdog", action: "found 2 missing signatures", ts: "11:09", type: "issue", tokens: 900 },
        { agent: "Watchdog", action: "drafted nudge to the 2 owners", ts: "11:10", type: "assignment", tokens: 1500 },
        { agent: "Logger", action: "wrote the audit trail", ts: "11:11", type: "assignment", tokens: 2100 },
        { agent: "Logger", action: "updated the status dashboard", ts: "11:12", type: "automation", tokens: 1100 }
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
        { agent: "Søker", action: "definerte 4 søk basert på temaet", ts: "15:25", type: "automation", tokens: 1500 },
        { agent: "Søker", action: "leste 18 kilder på temaet", ts: "15:30", type: "automation", tokens: 6400 },
        { agent: "Søker", action: "ekskluderte 3 utdaterte rapporter", ts: "15:34", type: "issue", tokens: 700 },
        { agent: "Sammenfatter", action: "trakk ut nøkkelfunn fra hver kilde", ts: "15:42", type: "automation", tokens: 3300 },
        { agent: "Sammenfatter", action: "skrev 2-siders brief med kilder", ts: "15:48", type: "assignment", tokens: 5100 },
        { agent: "Sammenfatter", action: "delte i Notion-prosjekt", ts: "15:50", type: "assignment", tokens: 800 }
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
        { agent: "Searcher", action: "shaped 4 queries from the topic", ts: "15:25", type: "automation", tokens: 1500 },
        { agent: "Searcher", action: "read 18 sources on the topic", ts: "15:30", type: "automation", tokens: 6400 },
        { agent: "Searcher", action: "excluded 3 outdated reports", ts: "15:34", type: "issue", tokens: 700 },
        { agent: "Synthesizer", action: "extracted key findings per source", ts: "15:42", type: "automation", tokens: 3300 },
        { agent: "Synthesizer", action: "wrote 2-page brief with citations", ts: "15:48", type: "assignment", tokens: 5100 },
        { agent: "Synthesizer", action: "posted in Notion project", ts: "15:50", type: "assignment", tokens: 800 }
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
        { agent: "Koordinator", action: "brøt ned oppgaven i 5 steg", ts: "09:00", type: "automation", tokens: 2300 },
        { agent: "Koordinator", action: "fordelte stegene mellom de andre", ts: "09:05", type: "assignment", tokens: 1100 },
        { agent: "Utfører", action: "kjørte de 4 første", ts: "09:18", type: "assignment", tokens: 4700 },
        { agent: "Utfører", action: "fikk feilmelding fra ett verktøy, prøvde igjen", ts: "09:21", type: "issue", tokens: 900 },
        { agent: "Sjekker", action: "kvalitetssikret resultatet", ts: "09:25", type: "automation", tokens: 2600 },
        { agent: "Koordinator", action: "skrev oppsummering tilbake til deg", ts: "09:28", type: "assignment", tokens: 1400 }
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
        { agent: "Coordinator", action: "broke the task into 5 steps", ts: "09:00", type: "automation", tokens: 2300 },
        { agent: "Coordinator", action: "split the steps across the others", ts: "09:05", type: "assignment", tokens: 1100 },
        { agent: "Executor", action: "ran the first 4", ts: "09:18", type: "assignment", tokens: 4700 },
        { agent: "Executor", action: "hit a tool error, retried successfully", ts: "09:21", type: "issue", tokens: 900 },
        { agent: "Reviewer", action: "checked the output", ts: "09:25", type: "automation", tokens: 2600 },
        { agent: "Coordinator", action: "wrote a summary back to you", ts: "09:28", type: "assignment", tokens: 1400 }
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
  ["research", /\b(research\w*|undersøk\w*|search\w*|finn\s+ut|kartlegg\w*|analyse\w*|analys\w*)\b/i],
  ["content_social", /\b(market\w*|markedsf\w*|content|innhold|social\w*|sosiale|post\w*|linkedin|instagram)\b/i],
  ["scheduling", /\b(møte\w*|meeting\w*|schedule\w*|\bbook(?:ed|ing|er|ings|s)?\b|kalender|calendar|appointment\w*)\b/i],
  ["hr_onboarding", /\b(onboard\w*|hr|ansatt\w*|employee\w*|hire\w*|new\s+hire)\b/i],
  ["data_entry", /\b(data\s*entry|skriv\s+inn|punche\w*|kvittering\w*|receipt\w*|spreadsheet\w*|regneark|bookkeep\w*)\b/i],
  ["reporting", /\b(rapport\w*|report\w*|kpi|dashboard\w*|metric\w*|måltall)\b/i],
  ["procurement", /\b(innkjøp\w*|procure\w*|tilbud\w*|quote\w*|leverandør\w*|vendor\w*|supplier\w*)\b/i],
  ["compliance", /\b(compliance|audit\w*|revisjon\w*|policy|gdpr|regulatory|samsvar)\b/i]
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
