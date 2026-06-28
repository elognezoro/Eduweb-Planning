import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { Resend } from "resend";
import { buildAuthEmail, type AuthEmailAction } from "@/lib/email/auth-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Send Email Hook de Supabase Auth.
 *
 * Supabase appelle cette route (au lieu d'envoyer lui-même l'e-mail) à chaque
 * action d'authentification (inscription, récupération, lien magique…). On
 * vérifie la signature du webhook, on construit le lien de confirmation vers
 * notre /auth/callback, puis on envoie un e-mail BRANDÉ via Resend.
 *
 * Variables d'environnement requises :
 *   - SEND_EMAIL_HOOK_SECRET  : secret du hook (format « v1,whsec_… » fourni par Supabase)
 *   - RESEND_API_KEY          : clé API Resend
 *   - RESEND_FROM (option.)   : expéditeur (défaut « EduWeb Planner <no-reply@planning.eduweb.ci> »)
 */
const SITE_URL = "https://planning.eduweb.ci";

interface HookPayload {
  user?: { email?: string; new_email?: string };
  email_data?: {
    token_hash?: string;
    token_hash_new?: string;
    email_action_type?: string;
    redirect_to?: string;
    site_url?: string;
  };
}

/**
 * Actions d'authentification SUPPORTÉES (à lien). Toute action absente de cette
 * table est rejetée AVANT envoi : on n'expédie jamais un e-mail dont le lien
 * serait invalide côté /auth/callback. `type` est le EmailOtpType passé à
 * verifyOtp ; `useNewEmail` = cible/jeton de la nouvelle adresse (email_change).
 */
const ACTIONS: Record<
  string,
  { type: string; next: string; email: AuthEmailAction; useNewEmail?: boolean }
> = {
  signup: { type: "signup", next: "/dashboard", email: "signup" },
  invite: { type: "invite", next: "/dashboard", email: "invite" },
  magiclink: { type: "magiclink", next: "/dashboard", email: "magiclink" },
  recovery: { type: "recovery", next: "/reset-password", email: "recovery" },
  email_change: { type: "email_change", next: "/dashboard", email: "email_change" },
  email_change_current: { type: "email_change", next: "/dashboard", email: "email_change" },
  email_change_new: {
    type: "email_change",
    next: "/dashboard",
    email: "email_change",
    useNewEmail: true,
  },
};

/** Masque une adresse pour les logs (pas de PII en clair). */
function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 2)}***@${domain}`;
}

export async function POST(request: Request) {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;
  const apiKey = process.env.RESEND_API_KEY;
  if (!secret || !apiKey) {
    return NextResponse.json(
      { error: { http_code: 500, message: "E-mail non configuré (clés manquantes)." } },
      { status: 500 },
    );
  }

  const raw = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  };

  let payload: HookPayload;
  try {
    const wh = new Webhook(secret.replace("v1,whsec_", ""));
    payload = wh.verify(raw, headers) as HookPayload;
  } catch {
    console.error("[email-hook] signature de webhook invalide");
    return NextResponse.json(
      { error: { http_code: 401, message: "Signature du webhook invalide." } },
      { status: 401 },
    );
  }

  const data = payload.email_data;
  const action = data?.email_action_type ?? "signup";
  const conf = ACTIONS[action];
  if (!data || !conf) {
    // Action inconnue : on NE PART PAS un e-mail dont le lien serait invalide.
    console.error(`[email-hook] action non supportée : ${action}`);
    return NextResponse.json(
      { error: { http_code: 400, message: "Action d'authentification non supportée." } },
      { status: 400 },
    );
  }

  const to = conf.useNewEmail
    ? payload.user?.new_email ?? payload.user?.email
    : payload.user?.email;
  const tokenHash = conf.useNewEmail
    ? data.token_hash_new ?? data.token_hash ?? ""
    : data.token_hash ?? "";
  if (!to || !tokenHash) {
    return NextResponse.json(
      { error: { http_code: 400, message: "Charge utile invalide." } },
      { status: 400 },
    );
  }

  // Lien de confirmation → notre /auth/callback (verifyOtp côté serveur).
  const siteUrl = (data.site_url || SITE_URL).replace(/\/+$/, "");
  const url = `${siteUrl}/auth/callback?token_hash=${encodeURIComponent(
    tokenHash,
  )}&type=${encodeURIComponent(conf.type)}&next=${encodeURIComponent(conf.next)}`;

  const { subject, html } = buildAuthEmail(conf.email, url, new Date().getFullYear());

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || "EduWeb Planner <no-reply@planning.eduweb.ci>";
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error(
      `[email-hook] échec Resend (${action} → ${maskEmail(to)}) : ${error.name} — ${error.message}`,
    );
    return NextResponse.json(
      { error: { http_code: 502, message: error.message } },
      { status: 502 },
    );
  }
  return NextResponse.json({ success: true });
}
