import { llmsFullTxt } from "../_lib/llmsContent";

// 10 min ISR — picks up newly published Insight posts without redeploying.
export const revalidate = 600;

export async function GET() {
  return new Response(await llmsFullTxt(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=600, s-maxage=600"
    }
  });
}
