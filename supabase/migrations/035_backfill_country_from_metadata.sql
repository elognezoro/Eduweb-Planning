-- ============================================================================
-- 035 — Correction RÉTROACTIVE du pays des comptes existants.
--
-- 034 avait posé country_code = 'CI' forfaitairement pour tous les profils
-- existants. Or le pays RÉELLEMENT choisi à l'inscription est conservé dans
-- auth.users.raw_user_meta_data->>'country' (le sélecteur était fonctionnel ;
-- seuls l'affichage admin et la persistance manquaient).
--
-- Cette migration rebackfille profiles.country_code (et country_id quand le pays
-- existe dans `countries`) à partir de cette métadonnée. Les comptes ayant choisi
-- un pays ≠ CI sont corrigés ; ceux restés sur le défaut « CI » le restent
-- (leur pays réel n'a jamais été capturé → non récupérable).
--
-- Idempotent. À appliquer après 034.
-- ============================================================================

-- 1) Code ISO2 = pays choisi à l'inscription (s'il est renseigné).
update public.profiles p
set country_code = upper(nullif(trim(u.raw_user_meta_data->>'country'), '')),
    updated_at = now()
from auth.users u
where u.id = p.id
  and nullif(trim(u.raw_user_meta_data->>'country'), '') is not null
  and upper(trim(u.raw_user_meta_data->>'country')) is distinct from coalesce(p.country_code, '');

-- 2) Aligne country_id quand le pays est connu de la table `countries` (ex. CI).
update public.profiles p
set country_id = c.id
from auth.users u
join public.countries c
  on c.iso2 = upper(nullif(trim(u.raw_user_meta_data->>'country'), ''))
where u.id = p.id
  and (p.country_id is null or p.country_id is distinct from c.id);
