import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

/**
 * Lien d'inscription COURT : `/i/<code>` → redirige vers
 * `/register?invite=<jeton>` (migration 009). Public (pas d'auth).
 * Si le code est introuvable / backend non configuré → renvoie vers /register.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const origin =
    _request.headers.get("origin") ?? new URL(_request.url).origin;

  if (isSupabaseConfigured() && code) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("invite_links")
        .select("token")
        .eq("code", code)
        .maybeSingle();
      const token = (data as { token?: string } | null)?.token;
      if (token) {
        return NextResponse.redirect(
          new URL(`/register?invite=${encodeURIComponent(token)}`, origin),
        );
      }
    } catch {
      /* ignore → repli sur /register */
    }
  }
  return NextResponse.redirect(new URL("/register", origin));
}
