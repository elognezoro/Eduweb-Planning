import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isSuperAdminEmail } from "@/lib/super-admins";

export const runtime = "nodejs";

/**
 * Confirme l'e-mail d'un compte (API admin, service role).
 *
 * Appelée quand l'admin VALIDE un compte (statut → actif). La confirmation de
 * compte côté app (`profiles.status`) ne confirme PAS l'e-mail côté Auth ;
 * or, si la confirmation d'e-mail est activée, un utilisateur auto-inscrit ne
 * peut pas se connecter tant que son e-mail n'est pas confirmé. Cette route
 * lève ce blocage.
 *
 * Autorisation : appelant administrateur (RPC `is_admin`). Service role requis.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Indisponible : backend non configuré." },
      { status: 503 },
    );
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          "Confirmation d'e-mail indisponible : définissez SUPABASE_SERVICE_ROLE_KEY (Vercel → Environment Variables) puis redéployez.",
      },
      { status: 501 },
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

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
