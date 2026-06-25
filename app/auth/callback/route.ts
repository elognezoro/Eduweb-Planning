import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Callback d'authentification (confirmation d'e-mail, lien magique, récupération).
 *
 * Le lien envoyé par e-mail à l'auto-inscription redirige ici. On FINALISE la
 * confirmation côté app :
 *   - flux `token_hash` + `type` (recommandé @supabase/ssr) → verifyOtp ;
 *   - flux `code` (PKCE) → exchangeCodeForSession ;
 * puis on pose la session (cookies) et on redirige vers `next` (par défaut le
 * tableau de bord). Sans cette route, le lien retombait sur /login sans rien
 * valider.
 *
 * Pré-requis Supabase : Site URL + Redirect URLs doivent pointer le domaine de
 * production (sinon GoTrue redirige vers localhost).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") || "/dashboard";

  // Base de redirection robuste derrière le proxy Vercel.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = !isLocal && forwardedHost ? `https://${forwardedHost}` : url.origin;

  const supabase = await createClient();

  let ok = false;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  if (ok) {
    // `next` doit rester un chemin interne (anti open-redirect).
    const safeNext = next.startsWith("/") ? next : "/dashboard";
    return NextResponse.redirect(`${base}${safeNext}`);
  }

  return NextResponse.redirect(
    `${base}/login?error=${encodeURIComponent("Lien de confirmation invalide ou expiré.")}`,
  );
}
