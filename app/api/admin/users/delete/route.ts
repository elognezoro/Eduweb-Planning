import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

/**
 * Suppression DÉFINITIVE d'un compte utilisateur.
 *
 * Délègue à la fonction SQL `admin_delete_user` (SECURITY DEFINER, migration
 * 007) : pas besoin de clé service role — l'autorisation est vérifiée DANS la
 * base (admin uniquement ; ni soi-même, ni un super-administrateur). La
 * suppression de `auth.users` propage en cascade au profil et aux données
 * liées selon les politiques FK (migration 006). IRRÉVERSIBLE.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Suppression indisponible : backend non configuré." },
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

  const body = (await request.json().catch(() => ({}))) as { userId?: unknown };
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  if (!userId) {
    return NextResponse.json({ error: "userId requis." }, { status: 400 });
  }

  // Autorisation + garde-fous (admin, self, super-admin, introuvable) sont dans
  // la fonction SECURITY DEFINER. Les FK gèrent les données liées (cascade/null).
  const { error } = await supabase.rpc("admin_delete_user", {
    p_user_id: userId,
  });

  if (error) {
    const msg = error.message ?? "";
    if (/could not find|does not exist|schema cache/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "Fonction de suppression absente côté base : appliquez la migration 007.",
        },
        { status: 501 },
      );
    }
    if (/foreign key|constraint|violates/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "Ce compte possède des données liées qui empêchent sa suppression. Appliquez la migration 006, ou archivez le compte.",
        },
        { status: 409 },
      );
    }
    const status = /administrateurs|protégé|refusé/i.test(msg)
      ? 403
      : /introuvable/i.test(msg)
        ? 404
        : /propre compte/i.test(msg)
          ? 400
          : /authentifié/i.test(msg)
            ? 401
            : 502;
    return NextResponse.json({ error: msg }, { status });
  }

  return NextResponse.json({ ok: true });
}
