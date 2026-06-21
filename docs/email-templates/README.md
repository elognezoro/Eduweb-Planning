# Modèles d'e-mails EduWeb Planner (Supabase Auth)

Modèles HTML aux couleurs EduWeb Planner pour les e-mails d'authentification Supabase.
Compatibles e-mail (mise en page en `<table>`, styles **inline**, polices web-safe,
bouton « bulletproof »). Couleurs de marque : vert `#176b45` / `#105234`, or `#eba52a`,
fond `#f0fbf5`.

## Où coller ces modèles

Tableau de bord Supabase → **Authentication** → **Emails** → onglet **Templates** →
choisir le modèle → coller l'**objet** (Subject) et le **corps HTML** (Message body) →
**Save**.

URL directe : https://supabase.com/dashboard/project/gibzjknamimpevfcqpdg/auth/templates

> ℹ️ Le **nom d'expéditeur** (« EduWeb Planner ») ne se règle PAS ici : il se définit
> dans **Authentication → Emails → SMTP Settings** (champ *Sender name*), après activation
> d'un SMTP personnalisé. Voir la discussion projet.

## Correspondance fichier → modèle Supabase

| Fichier | Modèle Supabase | Objet suggéré | Variable clé |
|---|---|---|---|
| `confirm-signup.html` | Confirm signup | Confirmez votre inscription à EduWeb Planner | `{{ .ConfirmationURL }}` |
| `reset-password.html` | Reset Password | Réinitialisation de votre mot de passe EduWeb Planner | `{{ .ConfirmationURL }}` |
| `magic-link.html` | Magic Link | Votre lien de connexion EduWeb Planner | `{{ .ConfirmationURL }}` |
| `invite.html` | Invite user | Vous êtes invité(e) sur EduWeb Planner | `{{ .ConfirmationURL }}` |
| `change-email.html` | Change Email Address | Confirmez votre nouvelle adresse e-mail — EduWeb Planner | `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` |
| `reauthentication.html` | Reauthentication | Votre code de vérification EduWeb Planner | `{{ .Token }}` (code à 6 chiffres) |

## Notes

- Ne modifiez pas les variables `{{ .ConfirmationURL }}` / `{{ .Token }}` : Supabase les
  remplace à l'envoi.
- La 1re ligne `<div style="display:none…">` est le **preheader** (aperçu affiché dans la
  boîte de réception) — adaptez-le si besoin.
- Le bandeau utilise un libellé texte « EduWeb » + « EduWeb Planner ». Pour un vrai logo,
  remplacez-le par une balise `<img src="https://…/logo.png" …>` hébergée (un logo en
  pièce jointe/CID n'est pas géré par les templates Supabase).
- Testez l'aperçu via le bouton **Preview** de Supabase, puis envoyez-vous un e-mail réel.
</content>
