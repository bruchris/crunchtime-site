// humans.txt — http://humanstxt.org. A small "who built this site" file.
// Useful as a personality / authorship signal for crawlers and the
// occasional curious developer.

const BODY = `/* TEAM */

Founder: Christian Bru
Location: Bergen, Norway
Contact: hello@crunchtime.no

/* SITE */

Last update: 2026-05-07
Standards: HTML5, CSS, ES2022, Schema.org
Components: Next.js 16 (RSC + ISR), next-intl, Tailwind v4
Languages: Norsk, English

/* THANKS */

Customers who let us put agents on real work.
The open-source community behind Next.js, React, and the AI SDK.
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400, s-maxage=86400"
    }
  });
}
