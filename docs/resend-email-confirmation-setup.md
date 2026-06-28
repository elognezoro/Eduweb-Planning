# Confirmation de compte par e-mail (Resend) + activation automatique

Flux cible : **auto-inscription → e-mail de confirmation envoyé par Resend → clic
sur le lien → compte immédiatement actif et connecté**. Plus aucune validation
manuelle de l'administrateur.

## Architecture

1. `/register` appelle `supabase.auth.signUp(...)` (email + mot de passe).
2. Supabase Auth déclenche son **Send Email Hook** → `POST /api/auth/email-hook`.
3. La route vérifie la signature du webhook (standardwebhooks), construit le lien
   `…/auth/callback?token_hash=…&type=…` et envoie un e-mail **brandé via Resend**.
4. L'utilisateur clique → `/auth/callback` fait `verifyOtp` → session posée →
   redirection vers `/dashboard`.
5. La confirmation pose `auth.users.email_confirmed_at` → le **trigger
   `on_auth_email_confirmed`** (migration 036) passe `profiles.status` à `active`.

Code : `app/api/auth/email-hook/route.ts`, `lib/email/auth-email.ts`,
`app/auth/callback/route.ts`, `supabase/migrations/036_auto_activate_on_email_confirm.sql`.

## Configuration (à faire dans les tableaux de bord — JAMAIS dans le code)

### 1. Variables d'environnement Vercel
`Project → Settings → Environment Variables` (Production **et** Preview) :

| Variable | Valeur | Secret |
|---|---|---|
| `RESEND_API_KEY` | la clé API Resend (`re_…`) | 🔒 oui |
| `SEND_EMAIL_HOOK_SECRET` | le secret généré par Supabase pour le hook (`v1,whsec_…`) | 🔒 oui |
| `RESEND_FROM` *(optionnel)* | `EduWeb Planner <no-reply@planning.eduweb.ci>` | non |

Redéployer après ajout (ou laisser le prochain push le faire).

### 2. Supabase — Send Email Hook
`Authentication → Hooks → Send Email Hook` :
- **Enable**.
- Type **HTTPS**, URL : `https://planning.eduweb.ci/api/auth/email-hook`.
- **Generate secret** → copier la valeur (`v1,whsec_…`) → la coller dans
  `SEND_EMAIL_HOOK_SECRET` côté Vercel.

> Une fois le hook actif, **Supabase n'envoie plus ses propres e-mails** : tous
> les e-mails d'auth passent par cette route + Resend. Les templates de l'éditeur
> Supabase sont ignorés (le HTML est produit par `lib/email/auth-email.ts`).

### 3. Supabase — Auth
`Authentication → Providers → Email` :
- **Confirm email = ON** (sinon le compte est actif sans e-mail).

`Authentication → URL Configuration` :
- **Site URL** : `https://planning.eduweb.ci`
- **Redirect URLs** : `https://planning.eduweb.ci/auth/callback` et `https://planning.eduweb.ci/**`

### 4. Migration
Appliquer `supabase/migrations/036_auto_activate_on_email_confirm.sql` dans le
SQL Editor (active le trigger + backfill des comptes déjà confirmés).

### 5. (Recommandé) Anti-abus
`Authentication → Rate Limits` : plafonner les e-mails/heure. Optionnel : activer
un CAPTCHA (Turnstile/hCaptcha) sur l'inscription publique.

## Vérification
1. S'inscrire avec une adresse réelle → un e-mail Resend « Confirmez votre compte »
   doit arriver (vérifier aussi les indésirables).
2. Cliquer → arrivée sur `/dashboard`, connecté.
3. Dans Supabase, `profiles.status` du compte = `active`.
4. Logs Resend (dashboard) : e-mail `delivered`.
