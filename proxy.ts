import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Markdown content negotiation: if a client (a tool, an AI client wrapper,
// or a curious crawler) sends `Accept: text/markdown`, hand them the
// /llms-full.txt digest instead of HTML. Also advertise the digest on
// every HTML response via a Link header so AI clients can discover it.
//
// Why: AI engines that ingest pages either run JS or read raw HTML. A
// pre-rendered markdown twin lowers their token cost and makes the
// content trivially parseable. Vercel and Mintlify already do this;
// it's a quiet differentiator.
export default function proxy(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/markdown")) {
    // Rewrite (not redirect) so the URL the client requested stays the
    // same in their address bar / logs, but the body served is markdown.
    const url = request.nextUrl.clone();
    url.pathname = "/llms-full.txt";
    const res = NextResponse.rewrite(url);
    res.headers.set("vary", "accept");
    return res;
  }

  const res = intlMiddleware(request);
  // Advertise the markdown twin on every HTML response. The `alternate`
  // rel + `type=text/markdown` matches the IETF spec for content-type
  // alternates; AI clients implementing content negotiation can
  // discover it without guessing.
  res.headers.append(
    "link",
    "</llms-full.txt>; rel=\"alternate\"; type=\"text/markdown\""
  );
  res.headers.append("vary", "accept");
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
