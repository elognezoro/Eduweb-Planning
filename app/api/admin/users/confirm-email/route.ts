import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isSuperAdminEmail } from "@/lib/super-admins";

export const runtime = "nodejs";

/**
 * Confirme l'e-mail d'un compte (→ connexion possible).
 *
 * Appelée quand l'admin VALIDE un compte (statut → actif). La confirmation côté
 * app (`profiles.status`) ne confirme PAS l'e-mail côté Auth ; or, si la
 * confirmation d'e-mail est activée, un compte auto-inscrit ne peut pas se
 * connecter tant que son e-mail n'est pas confirmé.
 *
 * Implémentation SANS clé service role : RPC `admin_confirm_email` (SECURITY
 * DEFINER, migration 033) — l'autorisation (admin) est vérifiée dans la base et
 * l'appel se fait avec la session de l'administrateur. Évite l'erreur
 * « clé incorrecte » de l'API admin avec les nouvelles clés `sb_secret_`.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Indisponible : backend non configuré." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin =
    (prof?.role as string | undefined) === "admin" ||
    isSuperAdminEmail(user.email);
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Réservé à l'administrateur." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { userId?: unknown };
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  if (!userId) {
    return NextResponse.json({ error: "userId requis." }, { status: 400 });
  }

  const { error } = await supabase.rpc("admin_confirm_email", {
    p_user_id: userId,
  });
  if (error) {
    const msg = error.message ?? "";
    if (/could not find|does not exist|schema cache/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "Fonction de confirmation absente côté base : appliquez la migration 033.",
        },
        { status: 501 },
      );
    }
    const status = /administrateur|refusé|protégé/i.test(msg) ? 403 : 502;
    return NextResponse.json({ error: msg }, { status });
  }

  return NextResponse.json({ ok: true });
}
