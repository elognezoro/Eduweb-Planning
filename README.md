# EduWeb Planner

> **Piloter, planifier et accompagner chaque parcours scolaire.**
> Plateforme internationale de gestion, de planification et de pilotage scolaire.

EduWeb Planner centralise les processus pédagogiques, administratifs, statistiques
et de pilotage des établissements, structures de formation (CAFOP/APFC), inspections,
directions régionales, parents et élèves. L'architecture est **multi-pays**,
**multilingue** et **multi-établissement** : la Côte d'Ivoire est active par défaut,
mais aucun libellé spécifique (DRENA, CAFOP, APFC, FCFA…) n'est codé en dur.

---

## 1. Présentation

- **13 rôles** et un RBAC centralisé (~60 permissions) avec **mode aperçu de rôle**.
- **42 modules** : emplois du temps, registre d'appel, cahier de texte, notes &
  bulletins, livret scolaire, inspections, grilles d'évaluation, rapports,
  statistiques, CAFOP, APFC, convertisseur CSV Moodle, communication, rendez-vous,
  alertes SMS, facturation, design & thème, installation…
- **Design system** vert bouteille institutionnel + or, typographie arrondie
  **Nunito Sans**, graphiques **Recharts**, états *loading / empty / error / forbidden*.
- **Exports PDF / Word** et **imports CSV** robustes (prévisualisation, validation, modèle).
- Données de démonstration intégrées : l'interface est exploitable **sans base connectée**.

## 2. Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript strict |
| Styles | Tailwind CSS v4 |
| Composants | Radix UI (style shadcn/ui New York) |
| Icônes | Lucide React |
| Graphiques | Recharts |
| Formulaires | React Hook Form + Zod |
| Tableaux | TanStack Table |
| Auth / DB | Supabase (Auth, PostgreSQL, RLS) |
| Paiements | Stripe (couche extensible mobile money) |
| Documents | docx (Word), jsPDF (PDF) |
| i18n | next-intl (fr par défaut, en prêt) |
| Notifications | Sonner |

## 3. Installation

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev                  # http://localhost:3000
```

> L'application démarre en **mode démo** (données mockées) même sans Supabase.

## 4. Variables d'environnement

Voir [`.env.example`](.env.example). Principales clés :

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app |
| `NEXT_PUBLIC_DEFAULT_LOCALE` / `NEXT_PUBLIC_DEFAULT_COUNTRY` | Défauts (fr / CI) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Connexion Supabase (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts serveur / seed (ne jamais exposer) |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Facturation |
| `SMS_PROVIDER` / `SMS_API_KEY` / `SMS_SENDER_ID` | Alertes SMS (mock par défaut) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Compte admin initial (seed) |

## 5. Supabase & migrations

Migrations SQL dans [`supabase/migrations/`](supabase/migrations) :

1. `001_init.sql` — schéma complet (référentiels, profils, vie scolaire, inspections, CAFOP/APFC, facturation, thème…).
2. `002_rls.sql` — Row Level Security : fonctions utilitaires + politiques par rôle/périmètre.
3. `003_seed_ci.sql` — données de référence Côte d'Ivoire (pays, régions, cycles, niveaux, disciplines, périodes, plans).

Exécution : via l'éditeur SQL Supabase, ou la CLI Supabase (`supabase db push`).

Buckets de stockage à créer : `avatars`, `logos`, `reports`, `imports`, `attachments`, `exports`.

## 6. Seed administrateur

```bash
npm run seed
```

Crée l'utilisateur `admin` (auth + profil) à partir de `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD`. **Ne jamais committer de vrai mot de passe.**

## 7. Scripts

| Script | Description |
|---|---|
| `npm run dev` | Démarrage local |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run format` | Prettier |
| `npm run seed` | Compte admin initial |

## 8. Déploiement Vercel

1. Importer le dépôt sur Vercel.
2. Renseigner les variables d'environnement.
3. Build command `next build` (détecté automatiquement).

## 9. Gestion des rôles (RBAC)

- Rôles : [`lib/roles.ts`](lib/roles.ts) — 13 rôles, familles, libellés, tons.
- Permissions : [`lib/permissions.ts`](lib/permissions.ts) — catalogue, matrice rôle→permissions, `hasPermission()`.
- Navigation filtrée : [`lib/navigation.ts`](lib/navigation.ts).
- **Ajouter un rôle** : l'ajouter à `USER_ROLES`, définir ses permissions dans `ROLE_PERMISSIONS`.

## 10. Internationalisation

- Config sans préfixe d'URL (locale par cookie `NEXT_LOCALE`) : [`i18n/request.ts`](i18n/request.ts).
- Catalogues : [`i18n/messages/fr.json`](i18n/messages/fr.json), [`en.json`](i18n/messages/en.json).
- **Ajouter une langue** : créer `messages/<code>.json` et l'ajouter à `SUPPORTED_LOCALES`.

## 11. Multi-pays

- Config pays : [`config/countries.ts`](config/countries.ts) (libellés DRENA/CAFOP/APFC configurables).
- Référentiels pédagogiques : [`config/education-systems.ts`](config/education-systems.ts).
- **Ajouter un pays** : ajouter une entrée à `COUNTRIES` (+ son système éducatif), passer `isActive: true`.

## 12. Structure des dossiers

```
app/                     Routes (App Router)
  (auth)/                login, register, reset-password
  (dashboard)/           dashboard + tous les modules
  api/                   csv (validate/convert), export (pdf/word), stripe/webhook
components/              app-shell, charts, dashboard, data-table, forms, layout, modules, ui
config/                  countries, education-systems, theme
i18n/                    request + messages
lib/                     roles, permissions, navigation, types, mock-data, exports, imports, schemas, supabase
supabase/migrations/     001_init, 002_rls, 003_seed_ci
scripts/seed.ts          Seed administrateur
proxy.ts                 Middleware (Next 16)
```

## 13. Exports & 14. Imports CSV

- **Exports** : [`lib/exports`](lib/exports) (PDF jsPDF + Word docx, en-tête/pied institutionnels) via le composant `ExportMenu`.
- **Imports** : [`lib/imports/csv.ts`](lib/imports/csv.ts) + `ImportCsvDialog` (détection séparateur, prévisualisation, validation, modèle). Convertisseur Moodle dédié : `/systeme/convertisseur-csv`.

## 15. Notes

- En mode démo, le compte affiché est administrateur ; le sélecteur **« Aperçu de rôle »** (barre supérieure) permet de visualiser l'interface de chaque rôle.
- Sécurité : valider les entrées (Zod), appliquer le RLS Supabase, journaliser les actions sensibles, privilégier le *soft-delete*.

---

© EduWeb Planner — Plateforme internationale de pilotage scolaire.
