-- ============================================================
--  Fermeture de l'injection de score par curl
--  À exécuter dans : Supabase > SQL Editor > New query > Run
-- ============================================================
--  ORDRE IMPÉRATIF :
--    1. ce script
--    2. déployer les Edge Functions start-game et submit-score
--    3. déployer le site
--
--  Entre l'étape 1 et l'étape 3, les scores ne s'enregistreront
--  plus (l'insertion directe est révoquée). Le site conserve les
--  parties en attente dans le navigateur et les renvoie ensuite,
--  mais mieux vaut enchaîner les trois étapes rapidement.
-- ============================================================

-- 1. Colonnes de télémétrie (si add_telemetry_and_tighten_cap.sql
--    n'a pas été passé, ce script s'en charge)
alter table public.scores
  add column if not exists nb_reponses int,
  add column if not exists duree_s     int;

-- 2. Sessions de jeu, à usage unique
create table if not exists public.game_sessions (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  used_at    timestamptz,
  rejected   text
);

create index if not exists game_sessions_created_at_idx
  on public.game_sessions (created_at desc);

alter table public.game_sessions enable row level security;
-- Aucune policy : anon et authenticated n'y touchent pas du tout.
-- Seules les Edge Functions (service_role) y accèdent.

-- 3. LE POINT CENTRAL : plus personne n'insère directement un score.
--    C'est ce drop qui ferme la faille curl.
drop policy if exists "scores_insert_public" on public.scores;

-- La lecture du classement reste publique.
drop policy if exists "scores_select_public" on public.scores;
create policy "scores_select_public"
  on public.scores
  for select
  to anon, authenticated
  using (true);

-- Aucune policy insert/update/delete => la table n'est plus
-- modifiable qu'avec la clé service_role, détenue uniquement par
-- les Edge Functions.

-- ------------------------------------------------------------
--  Vue de suivi
-- ------------------------------------------------------------
create or replace view public.scores_suspects as
select
  id, pseudo, nom, agence, score, nb_reponses, duree_s, created_at,
  case
    when nb_reponses is null then 'sans télémétrie (partie d''avant le verrouillage)'
    when duree_s > 0 and nb_reponses::numeric / duree_s > 0.75 then 'cadence très élevée'
    when score > 250 then 'score très élevé'
  end as motif
from public.scores
where nb_reponses is null
   or (duree_s > 0 and nb_reponses::numeric / duree_s > 0.75)
   or score > 250
order by score desc;

-- Parties refusées par le serveur : à surveiller après la mise en ligne
create or replace view public.parties_refusees as
select id, created_at, used_at, rejected
from public.game_sessions
where rejected is not null
order by used_at desc;

-- ------------------------------------------------------------
--  Vérification
-- ------------------------------------------------------------
select policyname, cmd from pg_policies
where schemaname = 'public' and tablename in ('scores', 'game_sessions')
order by tablename, policyname;
-- Attendu : une seule ligne, scores_select_public / SELECT
