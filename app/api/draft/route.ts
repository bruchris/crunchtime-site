import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "../../../i18n/routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildPreviewPath(locale: string | null, slug: string | null): string | null {
  if (!locale || !slug) return null;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) return null;

  const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!cleanSlug) return null;

  return `/${locale}/insights/${cleanSlug}`;
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.INSIGHTS_PREVIEW_SECRET;
  const redirectPath = buildPreviewPath(
    request.nextUrl.searchParams.get("locale"),
    request.nextUrl.searchParams.get("slug")
  );

  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "INSIGHTS_PREVIEW_SECRET is not configured" },
      { status: 503 }
    );
  }

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: "invalid secret" }, { status: 401 });
  }

  if (!redirectPath) {
    return NextResponse.json(
      { ok: false, error: "expected locale and slug query params" },
      { status: 400 }
    );
  }

  const preview = await draftMode();
  preview.enable();

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
