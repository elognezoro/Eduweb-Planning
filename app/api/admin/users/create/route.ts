import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isSuperAdminEmail } from "@/lib/super-admins";

export const runtime = "nodejs";

/**
 * Création d'un compte utilisateur PAR L'ADMIN.
 *
 * Crée un vrai utilisateur Supabase Auth (avec mot de passe, e-mail confirmé)
 * via l'API admin (service role), puis applique le rôle / statut / nom / tél.
 * choisis. Le compte apparaît donc dans la liste (table `profiles`) ET peut se
 * connecter immédiatement (pas de confirmation d'e-mail à faire).
 *
 * Autorisation : l'appelant doit être administrateur (RPC `is_admin`, contexte
 * appelant). La clé service role est REQUISE (création d'un Auth user) — sans
 * elle la route renvoie 501 avec un message explicite.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Création indisponible : backend non configuré." },
      { status: 503 },
    );
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          "Création serveur indisponible : définissez SUPABASE_SERVICE_ROLE_KEY dans les variables d'environnement Vercel (Settings → Environment Variables), puis redéployez.",
      },
      { status: 501 },
    );
  }

  // L'appelant doit être authentifié ET administrateur.
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

  const body = (await request.json().catch(() => ({}))) as {
    email?: unknown;
    password?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    phone?: unknown;
    role?: unknown;
    status?: unknown;
  };
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const role = typeof body.role === "string" ? body.role : "eleve";
  const status = body.status === "active" ? "active" : "pending";

  if (!/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "E-mail invalide." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Mot de passe : 8 caractères minimum." },
      { status: 400 },
    );
  }
  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Prénom et nom requis." }, { status: 400 });
  }

  const displayName = `${lastName} ${firstName}`.trim();
  const admin = createAdminClient();

  // 1) Créer l'utilisateur Auth, e-mail déjà confirmé → connexion possible.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      first_name: firstName,
      last_name: lastName,
      phone,
    },
  });
  if (createErr || !created?.user) {
    const msg = createErr?.message ?? "Création refusée.";
    const dup = /already|registered|exist/i.test(msg);
    return NextResponse.json(
      { error: dup ? "Un compte existe déjà avec cet e-mail." : msg },
      { status: dup ? 409 : 400 },
    );
  }

  // 2) Appliquer rôle / statut / nom / tél. (le trigger a créé le profil ;
  //    service role contourne le RLS et le garde anti-élévation — auth.uid() nul).
  const userId = created.user.id;
  const { error: profErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      email,
      display_name: displayName,
      role,
      status,
      phone: phone || null,
    },
    { onConflict: "id" },
  );
  if (profErr) {
    return NextResponse.json(
      {
        error: `Compte Auth créé mais profil non finalisé : ${profErr.message}`,
        userId,
      },
      { status: 207 },
    );
  }

  return NextResponse.json({ ok: true, userId });
}
