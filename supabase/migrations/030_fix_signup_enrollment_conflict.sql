-- ============================================================================
-- 030 — Corrige l'auto-inscription par lien à la création de compte.
--
-- BUG : le trigger handle_new_user (020) insérait dans course_enrollments avec
-- `on conflict (user_id, course_id)`, mais la migration 024 a remplacé cette
-- contrainte d'unicité par (user_id, course_id, school_year). Le ON CONFLICT
-- référence donc une contrainte INEXISTANTE → l'INSERT lève une erreur, avalée
-- par le `exception when others then null` du bloc → l'auto-inscription aux
-- cours offerts par un lien échoue SILENCIEUSEMENT à l'inscription.
--
-- CORRECTIF : recréer handle_new_user à l'identique en (1) ciblant la bonne
-- contrainte `on conflict (user_id, course_id, school_year)` et (2) stampant
-- explicitement school_year = current_school_year() (= le DEFAULT) pour que la
-- colonne d'arbitrage soit toujours renseignée.
--
-- Idempotent (create or replace). À appliquer après 020 et 024.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_etab_name text := nullif(trim(new.raw_user_meta_data->>'establishment_name'), '');
  v_etab_code text := nullif(trim(new.raw_user_meta_data->>'establishment_code'), '');
  v_etab_dsps text := nullif(trim(new.raw_user_meta_data->>'establishment_dsps'), '');
  v_country   uuid;
  v_etab_id   uuid;
begin
  insert into public.profiles (id, email, first_name, last_name, display_name, phone, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    nullif(trim(concat_ws(' ', new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name')), ''),
    new.raw_user_meta_data->>'phone',
    'eleve',
    'pending'
  )
  on conflict (id) do nothing;

  -- Rattachement à un établissement (référentiel CI). Best-effort : une donnée
  -- mal formée ne doit jamais faire échouer la création de compte.
  begin
    if v_etab_name is not null then
      select id into v_country
        from public.countries
       where iso2 = coalesce(new.raw_user_meta_data->>'country', 'CI');
      if v_country is not null then
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
    end if;
  exception when others then
    null;
  end;

  -- Auto-inscription aux cours du lien (OFFERT). formation_role forcé NULL.
  -- school_year stampé explicitement (= DEFAULT current_school_year()) pour que
  -- le ON CONFLICT (user_id, course_id, school_year) — contrainte posée par 024
  -- — puisse arbitrer correctement.
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
