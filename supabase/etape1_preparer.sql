-- ============================================================
--  ÉTAPE 1 / 2 — Préparation  (à lancer MAINTENANT)
--  Supabase > SQL Editor > New query > Run
-- ============================================================
--  Ce script n'enlève RIEN. Il ajoute seulement ce dont les
--  Edge Functions ont besoin. Le site actuellement en ligne
--  continue de fonctionner exactement comme avant : aucune
--  coupure, aucun score perdu.
--
--  L'étape 2 (fermeture de la faille) se lance APRÈS le
--  déploiement du site.
-- ============================================================

-- 1. Colonnes de télémétrie
alter table public.scores
  add column if not exists nb_reponses int,
  add column if not exists duree_s     int;

comment on column public.scores.nb_reponses is
  'Nombre de réponses de la partie, recalculé par submit-score.';
comment on column public.scores.duree_s is
  'Durée de la partie en secondes, recalculée par submit-score.';

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
-- Volontairement AUCUNE policy : ni anon ni authenticated n'y
-- accèdent. Seules les Edge Functions (service_role) y touchent.

-- 3. Vues de suivi
create or replace view public.parties_refusees as
select id, created_at, used_at, rejected
from public.game_sessions
where rejected is not null
order by used_at desc;

create or replace view public.scores_suspects as
select
  id, pseudo, nom, agence, score, nb_reponses, duree_s, created_at,
  case
    when nb_reponses is null then 'partie d''avant le verrouillage'
    when duree_s > 0 and nb_reponses::numeric / duree_s > 0.75
      then 'cadence très élevée'
    when score > 250 then 'score très élevé'
  end as motif
from public.scores
where nb_reponses is null
   or (duree_s > 0 and nb_reponses::numeric / duree_s > 0.75)
   or score > 250
order by score desc;

-- ------------------------------------------------------------
--  Vérification — attendu :
--    game_sessions_ok | t
--    colonnes_ok      | t
-- ------------------------------------------------------------
select
  to_regclass('public.game_sessions') is not null as game_sessions_ok,
  (select count(*) = 2
     from information_schema.columns
    where table_schema = 'public' and table_name = 'scores'
      and column_name in ('nb_reponses', 'duree_s')) as colonnes_ok;
