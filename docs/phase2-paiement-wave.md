# Phase 2 — Paiement serveur Wave

Paiement Mobile Money **côté serveur** via l'API Checkout de Wave, avec
inscription **durable et cross‑device** (Supabase). Tant que les variables
d'environnement et le schéma SQL ne sont pas en place, l'application continue
de fonctionner en **mode manuel/démo** (rien ne change).

## 1. Schéma Supabase (à exécuter une fois)

Dans le SQL Editor de Supabase :

```sql
-- Tarif serveur (fait foi pour le montant ; jamais transmis par le client)
create table if not exists public.course_prices (
  course_id  text primary key,
  amount_fcfa integer not null check (amount_fcfa >= 0),
  updated_at timestamptz not null default now()
);

-- Paiements
create table if not exists public.course_payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  course_id    text not null,
  amount_fcfa  integer not null,
  provider     text not null default 'wave',
  session_id   text,
  status       text not null default 'pending'
               check (status in ('pending','confirmed','failed')),
  created_at   timestamptz not null default now(),
  confirmed_at timestamptz
);
create index if not exists course_payments_user_idx on public.course_payments (user_id);

-- NB : la table `course_enrollments` (inscriptions durables) est la SOURCE DE
-- VÉRITÉ de la migration `008_course_enrollments.sql` — ne pas la redéclarer
-- ici. Le webhook Wave (service-role, contourne la RLS) y insère l'inscription
-- après paiement confirmé ; ses politiques RLS sont définies dans 008.

-- RLS : chacun lit ses propres lignes ; les écritures passent par le
-- service-role (webhook / route serveur), qui contourne le RLS.
alter table public.course_payments enable row level security;
alter table public.course_prices   enable row level security;

create policy "read own payments" on public.course_payments
  for select using (auth.uid() = user_id);
create policy "read prices"       on public.course_prices
  for select using (true);
```

Renseignez ensuite les tarifs serveur (ils doivent correspondre aux tarifs
affichés côté admin) :

```sql
insert into public.course_prices (course_id, amount_fcfa) values
  ('communication-pastorale', 10000),
  ('ia-communication', 15000)
on conflict (course_id) do update set amount_fcfa = excluded.amount_fcfa, updated_at = now();
```

## 2. Variables d'environnement (Vercel + `.env.local`)

| Variable | Côté | Rôle |
| --- | --- | --- |
| `WAVE_API_KEY` | serveur | Clé API Wave (Bearer) — initiation des paiements |
| `WAVE_WEBHOOK_SECRET` | serveur | Secret de signature du webhook Wave |
| `SUPABASE_SERVICE_ROLE_KEY` | serveur | Déjà requis — écritures privilégiées (webhook) |
| `NEXT_PUBLIC_WAVE_ENABLED` | public | Mettre `1` pour activer le checkout Wave côté client |

> Sans `WAVE_API_KEY` / `WAVE_WEBHOOK_SECRET`, les routes répondent
> « non configuré » et le checkout reste en mode manuel. Sans
> `NEXT_PUBLIC_WAVE_ENABLED=1`, le bouton « Payer avec Wave » ne s'affiche pas.

## 3. Webhook Wave

Dans le tableau de bord Wave, configurez l'URL de notification :

```
https://planning.eduweb.ci/api/payments/wave/webhook
```

Événements écoutés : `checkout.session.completed` (→ inscription),
`checkout.session.payment_failed` / `…expired` (→ échec).

> La vérification de signature (`Wave-Signature: t=…,v1=…`,
> HMAC‑SHA256 de `"<t>.<corps>"`) est implémentée dans `lib/payments/wave.ts`.
> Ajustez‑la si la documentation Wave de votre compte diffère.

## 4. Flux

1. Cours payant + `NEXT_PUBLIC_WAVE_ENABLED=1` → l'utilisateur voit « Payer avec Wave ».
2. `POST /api/payments/wave/initiate` : auth, lit le tarif **serveur**, crée un
   paiement `pending`, ouvre une session Wave, renvoie l'URL → redirection.
3. L'utilisateur paie sur Wave → redirection vers `/aide/paiement/retour`.
4. Wave appelle le webhook → signature vérifiée → paiement `confirmed` +
   `course_enrollments` (upsert idempotent).
5. La page de retour sonde le statut ; `CourseGate` lit l'inscription serveur
   (`useServerEnrollment`) → accès accordé sur tout appareil.

## 5. À compléter ultérieurement (hors de ce socle)

- Synchroniser automatiquement les tarifs admin (localStorage) vers
  `course_prices` (aujourd'hui : insert SQL manuel).
- Remboursement / réconciliation, journal d'audit serveur.
- Migration complète des inscriptions (cohortes, nominatives) vers Supabase.
