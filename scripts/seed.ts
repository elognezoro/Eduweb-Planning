/**
 * Script de seed — crée le compte administrateur initial dans Supabase.
 *
 * Prérequis : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD dans l'environnement (.env.local).
 *
 * Lancement : npm run seed
 *
 * Les données de référence (pays, régions, niveaux, disciplines…) sont créées
 * par les migrations SQL (supabase/migrations/003_seed_ci.sql).
 */
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!url || !serviceKey || !email || !password) {
    console.error(
      "❌ Variables manquantes. Renseignez NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD.",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("→ Création de l'utilisateur administrateur…");
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "Administrateur EduWeb" },
  });

  if (authError) {
    console.error("❌ Erreur création utilisateur :", authError.message);
    process.exit(1);
  }

  const userId = created.user?.id;
  if (!userId) {
    console.error("❌ Aucun identifiant utilisateur retourné.");
    process.exit(1);
  }

  // Rattache le pays par défaut (Côte d'Ivoire) si présent.
  const { data: country } = await supabase.from("countries").select("id").eq("iso2", "CI").maybeSingle();

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    first_name: "Administrateur",
    last_name: "EduWeb",
    display_name: "Administrateur EduWeb",
    role: "admin",
    status: "active",
    country_id: country?.id ?? null,
    preferred_locale: "fr",
  });

  if (profileError) {
    console.error("❌ Erreur création profil :", profileError.message);
    process.exit(1);
  }

  console.log(`✅ Administrateur créé : ${email}`);
  console.log("⚠️  Pensez à changer le mot de passe après la première connexion.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
