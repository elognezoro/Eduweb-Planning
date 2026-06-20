-- ============================================================================
-- 009 — Liens d'inscription COURTS (anti-hameçonnage).
--
-- Le jeton d'invitation auto-porteur produit une URL très longue (base64), qui
-- ressemble à de l'hameçonnage. Cette table associe un CODE court au jeton ;
-- la route publique `/i/<code>` redirige vers `/register?invite=<jeton>`.
-- Le lien partagé devient `https://planning.eduweb.ci/i/<code>` (court, du même
-- domaine officiel — bien plus rassurant qu'un raccourcisseur tiers).
--
-- Sécurité :
--   • SELECT public (résolution du code par n'importe quel visiteur — c'est le
--     but d'un lien d'invitation public).
--   • INSERT / DELETE réservés à l'admin (public.is_admin()).
--   • Le code ne donne accès qu'à ce que le jeton permet déjà (s'inscrire à des
--     formations) — pas de surface supplémentaire.
--
-- Idempotent. À appliquer dans Supabase → SQL Editor.
-- ============================================================================

create table if not exists public.invite_links (
  code       text primary key,
  token      text not null,
  label      text,
  created_at timestamptz not null default now()
);

alter table public.invite_links enable row level security;

drop policy if exists il_select on public.invite_links;
create policy il_select on public.invite_links for select using (true);

drop policy if exists il_insert on public.invite_links;
create policy il_insert on public.invite_links for insert with check (public.is_admin());

drop policy if exists il_delete on public.invite_links;
create policy il_delete on public.invite_links for delete using (public.is_admin());
