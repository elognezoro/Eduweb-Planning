-- ============================================================================
-- 034 — Persiste le PAYS de l'utilisateur choisi (ou auto-détecté) à l'inscription.
--
-- CONTEXTE : profiles.country_id est un FK vers `countries`, table seedée
-- UNIQUEMENT avec la Côte d'Ivoire (003). handle_new_user (030) ne renseignait
-- JAMAIS le pays du profil → l'admin affichait « CI » pour tout le monde, quel
-- que soit le pays réel de l'utilisateur.
--
-- CORRECTIF :
--   1) colonne TEXTE `profiles.country_code` (ISO2) — dénormalisée, accepte
--      n'importe quel pays sans devoir seeder toute la table `countries` ;
--   2) handle_new_user pose country_code (toujours) ET country_id (quand le pays
--      existe dans `countries`, ex. CI) depuis les métadonnées d'inscription ;
--   3) backfill : les profils existants (tous CI) reçoivent country_code = 'CI'.
--
-- Idempotent. À appliquer après 030.
-- ============================================================================

alter table public.profiles add column if not exists country_code text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_iso2      text := nullif(upper(trim(new.raw_user_meta_data->>'country')), '');
  v_etab_name text := nullif(trim(new.raw_user_meta_data->>'establishment_name'), '');
  v_etab_code text := nullif(trim(new.raw_user_meta_data->>'establishment_code'), '');
  v_etab_dsps text := nullif(trim(new.raw_user_meta_data->>'establishment_dsps'), '');
  v_country   uuid;
  v_etab_id   uuid;
begin
  -- Résolution best-effort de l'UUID du pays (countries n'a que CI seedé) ; le
  -- code ISO2 est de toute façon conservé en clair dans country_code (tout pays).
  begin
    select id into v_country from public.countries where iso2 = coalesce(v_iso2, 'CI');
  exception when others then
    v_country := null;
  end;

  insert into public.profiles (
    id, email, first_name, last_name, display_name, phone, role, status,
    country_code, country_id
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    nullif(trim(concat_ws(' ', new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name')), ''),
    new.raw_user_meta_data->>'phone',
    'eleve',
    'pending',
    coalesce(v_iso2, 'CI'),
    v_country
  )
  on conflict (id) do nothing;

  -- Rattachement à un établissement (référentiel CI). Best-effort : une donnée
  -- mal formée ne doit jamais faire échouer la création de compte.
  begin
    if v_etab_name is not null and v_country is not null then
      insert into public.etablissements (country_id, code, name, dsps_code, status)
        values (
          v_country,
          coalesce(v_etab_code,
                   'LIBRE-' || upper(regexp_replace(v_etab_name, '[^A-Za-z0-9]+', '-', 'g'))),
          v_etab_name,
          v_etab_dsps,
          'active'
        )
      on conflict (country_id, code) do update set name = excluded.name
      returning id into v_etab_id;
      if v_etab_id is not null then
        update public.profiles set etablissement_id = v_etab_id where id = new.id;
      end if;
    end if;
  exception when others then
    null;
  end;

  -- Auto-inscription aux cours du lien (OFFERT). Inchangé (voir 030).
  begin
    if jsonb_typeof(new.raw_user_meta_data->'invite_courses') = 'array' then
      insert into public.course_enrollments (user_id, course_id, formation_role, source, enrolled_by, school_year)
      select new.id, ce.course_id, null, 'admin', 'Lien d''inscription', public.current_school_year()
      from jsonb_array_elements_text(new.raw_user_meta_data->'invite_courses') as ce(course_id)
      on conflict (user_id, course_id, school_year) do nothing;
    end if;
  exception when others then
    null;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill : les profils existants sont tous ivoiriens.
update public.profiles set country_code = 'CI' where country_code is null;
