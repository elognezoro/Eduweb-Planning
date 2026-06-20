import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isSuperAdminEmail } from "@/lib/super-admins";

export const runtime = "nodejs";

/**
 * Suppression DÉFINITIVE d'un compte utilisateur.
 *
 * Supprime l'utilisateur de `auth.users` ; toutes les données liées partent en
 * cascade (FK `... references auth.users / profiles (id) on delete cascade` —
 * profil, inscriptions, paiements, certificats, etc.). IRRÉVERSIBLE.
 *
 * Garde-fous (fail-closed) :
 *  - backend Supabase + clé service role requis (sinon 503) ;
 *  - appelant authentifié ET administrateur (rôle `profiles.role = admin` ou
 *    super-admin), sinon 401/403 ;
 *  - interdiction de se supprimer soi-même ;
 *  - interdiction de supprimer un compte super-administrateur (protégé).
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Suppression définitive indisponible : backend non configuré." },
      { status: 503 },
    );
  }

  // 1) Authentification de l'appelant.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // 2) Autorisation : administrateur uniquement (fail-closed).
  const callerEmail = (user.email ?? "").trim().toLowerCase();
  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const callerIsAdmin =
    callerProfile?.role === "admin" || isSuperAdminEmail(callerEmail);
  if (!callerIsAdmin) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  // 3) Cible.
  const body = (await request.json().catch(() => ({}))) as { userId?: unknown };
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  if (!userId) {
    return NextResponse.json({ error: "userId requis." }, { status: 400 });
  }
  if (userId === user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // 4) Garde-fou : ne jamais supprimer un super-administrateur.
  const { data: target } = await admin.auth.admin.getUserById(userId);
  if (!target?.user) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }
  if (isSuperAdminEmail(target.user.email)) {
    return NextResponse.json(
      { error: "Ce compte super-administrateur est protégé." },
      { status: 403 },
    );
  }

  // 5) Suppression définitive. Les données liées sont traitées par les FK
  //    (cascade / set null) — cf. migration 002_user_deletion_referential_actions.
  //    Tant que cette migration n'est pas appliquée, certaines dépendances en
  //    NO ACTION peuvent bloquer la suppression : on renvoie alors un message
  //    métier clair (et non l'erreur SQL brute).
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    const msg = error.message ?? "";
    const isFk = /foreign key|constraint|violates/i.test(msg);
    return NextResponse.json(
      {
        error: isFk
          ? "Ce compte possède des données liées qui empêchent sa suppression. Appliquez la migration de base 002 (politiques de suppression), ou archivez le compte."
          : `Suppression refusée : ${msg}`,
      },
      { status: isFk ? 409 : 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
