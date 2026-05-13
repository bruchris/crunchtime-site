// Builds the markdown digests served at /llms.txt and /llms-full.txt.
// Sourced from the same translation files the pages render from, so the
// AI-facing copy never drifts from the human-facing one.

import en from "../../messages/en.json";
import { listInsights } from "./insights/notionClient";

const SITE = "https://crunchtime.no";

const FAQ_KEYS = [
  "safety",
  "messy",
  "waiting",
  "ownership",
  "team",
  "languages",
  "industries",
  "starting"
] as const;

const SERVICE_KEYS = ["automation", "strategy", "implementation"] as const;
const PROCESS_KEYS = ["discovery", "strategy", "build", "followup"] as const;
const RESULT_KEYS = ["hours", "throughput", "errors", "speed"] as const;
const TIER_KEYS = ["discovery", "pilot", "retainer"] as const;

// Short index: what the site is + where to find structured detail.
// Spec: https://llmstxt.org
export async function llmsTxt(): Promise<string> {
  const s = en.services;
  const posts = await safeListEn();

  const insightLines = posts.length
    ? [
        "## Insights (sourced patterns and use cases)",
        "",
        "Patterns, numbers, and lessons from real AI agent deployments at named companies — distilled into playbooks SMBs can apply. Every claim cites a primary source.",
        "",
        ...posts.map(
          (p) =>
            `- [${p.title}](${SITE}/en/insights/${p.slug}): ${p.excerpt || p.subtitle || ""}`
        ),
        ""
      ]
    : [];

  return [
    "# Crunchtime",
    "",
    `> ${s.meta.description} Norwegian AI agency in Bergen — we build agents that take repetitive work off your team's calendar. Fixed price, live in under a month.`,
    "",
    "Crunchtime is a Norwegian (Bergen-based) AI consultancy. We build agentic systems that run in the background, talk to existing tools (Tripletex, Fiken, Shopify, Slack), and execute repetitive workflows end-to-end. Engagements are fixed-price; pilots ship in 18 days median.",
    "",
    "## Pages",
    "",
    `- [Home](${SITE}/en): Interactive Brief Box — describe a problem, see how a team of agents would handle it.`,
    `- [Services](${SITE}/en/services): Three offerings (automation, strategy, implementation), four-step process, pricing, FAQ.`,
    `- [Insights](${SITE}/en/insights): Sourced patterns and use cases on AI automation for SMBs (cited third-party case studies).`,
    `- [Facts](${SITE}/en/facts): Provable identity facts about Crunchtime — for grounding "what is Crunchtime" answers.`,
    `- [Contact](${SITE}/en/contact): Book a 30-minute call or send a message. Email: hello@crunchtime.no.`,
    `- [AI Glossary](${SITE}/en/ordliste): 30 AI terms defined concisely and citably — agents, RAG, MCP, and more.`,
    "",
    "## Norwegian (Norsk)",
    "",
    `- [Forside](${SITE}/no)`,
    `- [Tjenester](${SITE}/no/services)`,
    `- [Innsikt](${SITE}/no/insights)`,
    `- [Fakta](${SITE}/no/facts)`,
    `- [AI-ordliste](${SITE}/no/ordliste): 30 norske AI-begreper definert kort og siterbart.`,
    `- [Kontakt](${SITE}/no/contact)`,
    "",
    ...insightLines,
    "## Machine-readable",
    "",
    `- [Sitemap](${SITE}/sitemap.xml)`,
    `- [Full content (markdown)](${SITE}/llms-full.txt)`,
    ""
  ].join("\n");
}

async function safeListEn() {
  try {
    return await listInsights({ locale: "en" });
  } catch (err) {
    console.error("[llmsContent] failed to list insights for digest", err);
    return [];
  }
}

// Full content: every page rendered to clean markdown so models can ingest
// without parsing JS-heavy HTML or paying for image bytes.
export async function llmsFullTxt(): Promise<string> {
  const s = en.services;
  const c = en.contact;
  const lines: string[] = [];

  const heading = (level: number, text: string) =>
    lines.push(`${"#".repeat(level)} ${text}`, "");
  const p = (text: string) => lines.push(text, "");

  heading(1, "Crunchtime");
  p(
    "Norwegian AI agency in Bergen. We build agents that take repetitive work off your team's calendar. Fixed price, live in under a month."
  );
  p(`Site: ${SITE} · Contact: hello@crunchtime.no`);

  // Home
  heading(2, "Home");
  p(
    "The Crunchtime homepage centers on the Brief Box: visitors describe a real operational problem, and the site assembles a team of AI agents to show — concretely — how that problem would be handled. The intent is to replace the usual SaaS-template homepage with a working demo of the product."
  );

  // Services
  heading(2, "Services");
  p(s.hero.subline);

  heading(3, "What we do");
  for (const k of SERVICE_KEYS) {
    const item = s.servicesGrid.items[k];
    lines.push(`- **${item.title}**: ${item.body}`);
  }
  lines.push("");

  heading(3, "How we work");
  for (const k of PROCESS_KEYS) {
    const step = s.process.steps[k];
    lines.push(`${step.number}. **${step.title}** — ${step.body}`);
  }
  lines.push("");

  heading(3, "Results from first pilots");
  for (const k of RESULT_KEYS) {
    const r = s.results.items[k];
    lines.push(`- **${r.number} ${r.label}** (${r.tag}): ${r.body}`);
  }
  lines.push("");

  heading(3, "Pricing");
  p(s.pricing.subline);
  for (const k of TIER_KEYS) {
    const t = s.pricing.tiers[k];
    lines.push(`#### ${t.name} — ${t.price} (${t.duration})`);
    lines.push("");
    lines.push(t.pitch);
    lines.push("");
    lines.push(t.detail);
    lines.push("");
  }

  heading(3, "Frequently asked questions");
  for (const k of FAQ_KEYS) {
    const item = s.faq.items[k];
    lines.push(`**Q: ${item.q}**`);
    lines.push("");
    lines.push(`A: ${item.a}`);
    lines.push("");
  }

  // Contact
  heading(2, "Contact");
  p(c.hero.subline);
  p(
    "Email: hello@crunchtime.no. Founder: Christian Bru. Based in Bergen, Norway. We reply within one business day."
  );

  // Insights — list each published post as a citable summary.
  const posts = await safeListEn();
  if (posts.length) {
    heading(2, "Insights");
    p(
      "Sourced patterns and use cases on AI automation for small and medium businesses. Each post is grounded in third-party case studies (named companies, named numbers, linked sources) — not first-person claims about Crunchtime customers. Each post links to the full article."
    );
    for (const post of posts) {
      const url = `${SITE}/en/insights/${post.slug}`;
      lines.push(`### [${post.title}](${url})`);
      lines.push("");
      if (post.publishedAt) {
        lines.push(
          `_Published ${post.publishedAt.slice(0, 10)}${post.author ? ` · ${post.author}` : ""}${post.verticals.length ? ` · ${post.verticals.join(", ")}` : ""}_`
        );
        lines.push("");
      }
      if (post.subtitle) {
        lines.push(post.subtitle);
        lines.push("");
      }
      if (post.excerpt) {
        lines.push(post.excerpt);
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}
