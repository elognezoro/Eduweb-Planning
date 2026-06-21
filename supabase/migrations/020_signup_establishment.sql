-- ============================================================================
-- 020 — Inscription : rattachement à un établissement à la création du compte.
--
-- Le formulaire d'inscription transmet l'établissement choisi (référentiel CI)
-- dans les métadonnées : `establishment_code` (code EduWeb), `establishment_name`,
-- `establishment_dsps`. Le trigger `handle_new_user` (SECURITY DEFINER, donc
-- au-dessus de la RLS) matérialise l'établissement dans `etablissements` puis
-- pose `profiles.etablissement_id`. Un utilisateur normal ne peut PAS créer
-- d'établissement via l'API (RLS admin) ; seul ce trigger le fait, à partir de
-- SA propre inscription.
--
-- ⚠️ REDÉFINIT `handle_new_user` (déjà créée en 008) en CONSERVANT
--    l'auto-inscription par lien d'invitation. Appliquer APRÈS 008/019.
--    NE PAS rejouer 008 après 020.
--
-- Idempotent. À exécuter dans Supabase → SQL Editor.
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
  begin
    if jsonb_typeof(new.raw_user_meta_data->'invite_courses') = 'array' then
      insert into public.course_enrollments (user_id, course_id, formation_role, source, enrolled_by)
      select new.id, ce.course_id, null, 'admin', 'Lien d''inscription'
      from jsonb_array_elements_text(new.raw_user_meta_data->'invite_courses') as ce(course_id)
      on conflict (user_id, course_id) do nothing;
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
