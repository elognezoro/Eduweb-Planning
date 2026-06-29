-- ============================================================================
-- 045 — Journal des certificats délivrés + numérotation atomique serveur.
--
-- Problèmes corrigés :
--  1) Le journal des certificats était en localStorage → divergent d'un poste à
--     l'autre, non traçable. → table certificates_log (P-ETAB).
--  2) Le numéro officiel ETAB-ANNÉE-NNN était dérivé d'un compteur LOCAL → deux
--     postes pouvaient émettre le MÊME numéro. → séquence serveur atomique
--     (table cert_sequences + RPC SECURITY DEFINER) + contrainte d'unicité.
--
-- RLS : journal lisible/écrivable par l'établissement (can_write_school_record) ;
-- séquence inaccessible en direct (réservée à la RPC). Idempotent.
-- ============================================================================

-- Journal des certificats délivrés (cloisonné par établissement).
create table if not exists public.certificates_log (
  id text primary key,
  etablissement_id uuid references public.etablissements(id) on delete cascade,
  number text not null,
  beneficiary_name text not null,
  beneficiary_role text,
  issue_date text,
  formation_code text,
  formation_version text,
  valid_until text,
  establishment text,
  establishment_code text,
  delivered_by text,
  notes text,
  registered_by uuid references public.profiles(id),
  registered_at timestamptz not null default now(),
  unique (etablissement_id, number)
);

create index if not exists certificates_log_etab_idx on public.certificates_log (etablissement_id);

alter table public.certificates_log enable row level security;

drop policy if exists cert_select on public.certificates_log;
create policy cert_select on public.certificates_log
  for select using (
    public.is_admin() or etablissement_id = public.current_user_etablissement_id()
  );

drop policy if exists cert_write on public.certificates_log;
create policy cert_write on public.certificates_log
  for all
  using (
    public.can_write_school_record()
    and (public.is_admin() or etablissement_id = public.current_user_etablissement_id())
  )
  with check (
    public.can_write_school_record()
    and (public.is_admin() or etablissement_id = public.current_user_etablissement_id())
  );

-- Compteur de séquence par (code établissement, année). Accès direct interdit :
-- seule la fonction SECURITY DEFINER ci-dessous l'incrémente.
create table if not exists public.cert_sequences (
  etab_code text not null,
  year int not null,
  seq int not null default 0,
  primary key (etab_code, year)
);

alter table public.cert_sequences enable row level security;
-- Aucune policy → aucun accès direct (la RPC SECURITY DEFINER contourne la RLS).

-- Numérotation ATOMIQUE : incrémente puis renvoie « CODE-ANNÉE-NNN ». Réservée
-- au personnel habilité (can_write_school_record), même si SECURITY DEFINER.
create or replace function public.next_certificate_number(p_etab_code text, p_year int)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := coalesce(nullif(upper(regexp_replace(p_etab_code, '[^A-Za-z0-9-]', '', 'g')), ''), 'EDU');
  v_seq int;
begin
  if not public.can_write_school_record() then
    raise exception 'Droits insuffisants pour délivrer un certificat.';
  end if;
  insert into public.cert_sequences (etab_code, year, seq)
    values (v_code, p_year, 1)
    on conflict (etab_code, year) do update set seq = public.cert_sequences.seq + 1
    returning seq into v_seq;
  return v_code || '-' || p_year::text || '-' || lpad(v_seq::text, 3, '0');
end;
$$;

revoke all on function public.next_certificate_number(text, int) from public;
grant execute on function public.next_certificate_number(text, int) to authenticated;
