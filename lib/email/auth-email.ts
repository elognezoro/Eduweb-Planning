/* ============================================================================
   E-mails d'authentification EduWeb Planner (envoyés via Resend par le Send
   Email Hook de Supabase). HTML responsive, inline-styled (compatibilité clients
   mail), à la charte verte/or de la plateforme.
   ========================================================================== */

export type AuthEmailAction =
  | "signup"
  | "recovery"
  | "magiclink"
  | "email_change"
  | "email_change_new"
  | "invite";

interface Copy {
  subject: string;
  heading: string;
  intro: string;
  cta: string;
  note: string;
}

const COPY: Record<AuthEmailAction, Copy> = {
  signup: {
    subject: "Confirmez votre compte EduWeb Planner",
    heading: "Bienvenue sur EduWeb Planner",
    intro:
      "Merci de votre inscription. Confirmez votre adresse e-mail pour activer votre compte : il sera <strong>immédiatement actif et fonctionnel</strong> dès que vous aurez cliqué sur le bouton ci-dessous.",
    cta: "Confirmer mon compte",
    note: "Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet e-mail : aucun compte ne sera activé.",
  },
  invite: {
    subject: "Vous êtes invité(e) sur EduWeb Planner",
    heading: "Invitation à EduWeb Planner",
    intro:
      "Vous avez été invité(e) à rejoindre EduWeb Planner. Activez votre compte en cliquant sur le bouton ci-dessous.",
    cta: "Activer mon compte",
    note: "Si vous pensez avoir reçu cet e-mail par erreur, vous pouvez l'ignorer.",
  },
  recovery: {
    subject: "Réinitialisation de votre mot de passe",
    heading: "Réinitialisez votre mot de passe",
    intro:
      "Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.",
    cta: "Réinitialiser le mot de passe",
    note: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé.",
  },
  magiclink: {
    subject: "Votre lien de connexion EduWeb Planner",
    heading: "Connexion à EduWeb Planner",
    intro: "Cliquez sur le bouton ci-dessous pour vous connecter en toute sécurité.",
    cta: "Se connecter",
    note: "Si vous n'avez pas demandé ce lien, ignorez cet e-mail.",
  },
  email_change: {
    subject: "Confirmez votre nouvelle adresse e-mail",
    heading: "Confirmation d'adresse e-mail",
    intro: "Confirmez votre nouvelle adresse e-mail pour finaliser le changement sur votre compte.",
    cta: "Confirmer l'adresse",
    note: "Si vous n'êtes pas à l'origine de ce changement, contactez l'administrateur de votre établissement.",
  },
  email_change_new: {
    subject: "Confirmez votre nouvelle adresse e-mail",
    heading: "Confirmation d'adresse e-mail",
    intro: "Confirmez votre nouvelle adresse e-mail pour finaliser le changement sur votre compte.",
    cta: "Confirmer l'adresse",
    note: "Si vous n'êtes pas à l'origine de ce changement, contactez l'administrateur de votre établissement.",
  },
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Construit { subject, html } d'un e-mail d'authentification, brandé EduWeb. */
export function buildAuthEmail(
  action: AuthEmailAction,
  url: string,
  year: number,
): { subject: string; html: string } {
  const c = COPY[action] ?? COPY.signup;
  const safeUrl = esc(url);
  const html = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.heading)}</title></head>
<body style="margin:0;padding:0;background:#f1f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f2;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr><td style="background:#0f3d2e;padding:22px 32px;">
          <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:.2px;">EduWeb <span style="color:#d4af37;">Planner</span></span>
          <div style="font-size:11px;color:#a7c4b5;margin-top:2px;text-transform:uppercase;letter-spacing:.12em;">Pilotage scolaire</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 14px;font-size:22px;font-weight:800;color:#0f3d2e;">${esc(c.heading)}</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">${c.intro}</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" style="border-radius:10px;background:#15803d;">
            <a href="${safeUrl}" target="_blank" style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${esc(c.cta)}</a>
          </td></tr></table>
          <p style="margin:24px 0 6px;font-size:12px;color:#6b7280;">Ou copiez-collez ce lien dans votre navigateur :</p>
          <p style="margin:0 0 24px;font-size:12px;word-break:break-all;"><a href="${safeUrl}" style="color:#15803d;">${safeUrl}</a></p>
          <p style="margin:0;padding:14px 16px;background:#f3f6f4;border-radius:10px;font-size:12px;line-height:1.5;color:#6b7280;">${esc(c.note)} Ce lien expire après un délai limité pour votre sécurité.</p>
        </td></tr>
        <tr><td style="padding:18px 32px;border-top:1px solid #eef2f0;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">EduWeb Planner — Plateforme internationale de pilotage scolaire · <a href="https://planning.eduweb.ci" style="color:#15803d;">planning.eduweb.ci</a> · © ${year}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  return { subject: c.subject, html };
}
