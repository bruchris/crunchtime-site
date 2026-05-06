import { getTemplate, pickTemplate } from "../../_lib/cannedTemplates";
import type { Lang } from "../../_lib/briefSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}

function render(brief: string, lang: Lang): string {
  const tpl = getTemplate(pickTemplate(brief, lang), lang);
  const t = lang === "no"
    ? {
        title: "Teamet ditt",
        intro: "Hvis JavaScript var på, ville du sett dette spille seg ut. Her er et statisk sammendrag.",
        agents: "Foreslåtte agenter",
        logs: "Hva de ville gjort",
        rec: "Anbefaling",
        cta: "Book en 30-min prat",
        back: "Tilbake til forsiden"
      }
    : {
        title: "Your team",
        intro: "If JavaScript were on, you'd see this play out. Here's a static summary.",
        agents: "Suggested agents",
        logs: "What they would do",
        rec: "Recommendation",
        cta: "Book a 30-min chat",
        back: "Back to the home page"
      };

  const cal = process.env.NEXT_PUBLIC_CAL_BOOKING_LINK ?? `/${lang}/contact`;

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${escape(t.title)} · Crunchtime</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { font-family: system-ui, sans-serif; background:#0a0a09; color:#f5f3ee; max-width:720px; margin:0 auto; padding:32px 20px; }
    h1, h2 { font-weight: 800; }
    a { color:#d4ef3a; }
    ul { list-style: none; padding:0; }
    li { border-left: 2px solid #2a2a27; padding:10px 14px; margin-bottom:10px; }
    .rec { border-left: 2px solid #d4ef3a; padding:14px 16px; background:#1a1a18; margin-top:24px; }
    .cta { display:inline-block; background:#d4ef3a; color:#0a0a09; padding:12px 18px; font-weight:700; text-decoration:none; margin-top:14px; }
  </style>
</head>
<body>
  <h1>${escape(t.title)}</h1>
  <p>${escape(t.intro)}</p>
  <p><strong>${escape(lang === "no" ? "Din brief" : "Your brief")}:</strong> ${escape(brief)}</p>

  <h2>${escape(t.agents)}</h2>
  <ul>
    ${tpl.agents.map((a) => `<li><strong>${escape(a.name)}</strong> · ${escape(a.tools.join(", "))}</li>`).join("\n    ")}
  </ul>

  <h2>${escape(t.logs)}</h2>
  <ul>
    ${tpl.logs.map((l) => `<li><code>${escape(l.ts)}</code> ${escape(l.agent)}: ${escape(l.action)}</li>`).join("\n    ")}
  </ul>

  <div class="rec">
    <h2 style="margin-top:0">${escape(tpl.recommendation.headline)}</h2>
    <p>${escape(tpl.recommendation.ask)}</p>
    <a class="cta" href="${escape(cal)}">${escape(t.cta)}</a>
  </div>

  <p style="margin-top:32px"><a href="/${lang}">${escape(t.back)}</a></p>
</body>
</html>`;
}

export async function POST(req: Request): Promise<Response> {
  const form = await req.formData();
  const briefRaw = (form.get("brief") ?? "").toString();
  const langRaw = (form.get("lang") ?? "no").toString();
  const lang: Lang = langRaw === "en" ? "en" : "no";
  const brief = briefRaw.slice(0, 500).trim() || (lang === "no" ? "(tom brief)" : "(empty brief)");

  return new Response(render(brief, lang), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
