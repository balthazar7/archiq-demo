-- ============================================================
--  Télémétrie anti-triche + resserrement du plafond de score
--  À exécuter dans : Supabase > SQL Editor > New query > Run
-- ============================================================
--  À LANCER AVANT (ou juste après) le déploiement du site.
--  Le code sait se rabattre sur un insert sans ces colonnes si
--  elles n'existent pas encore : aucun score ne sera perdu si
--  l'ordre n'est pas respecté.
-- ============================================================

-- 1. Colonnes de télémétrie
alter table public.scores
  add column if not exists nb_reponses int,
  add column if not exists duree_s     int;

comment on column public.scores.nb_reponses is
  'Nombre de réponses données pendant la partie (déclaré par le client).';
comment on column public.scores.duree_s is
  'Durée réelle de la partie en secondes (déclarée par le client).';

-- 2. Policy d'insertion : plafond abaissé + bornes sur la télémétrie
--    Plafond 350 et non 250 : une très bonne partie humaine
--    (≈62 bonnes réponses d'affilée) atteint déjà ~350 points à
--    cause du combo quadratique. Trop serrer bloquerait un joueur
--    honnête. Un bot parfait monterait à ~1450, donc 350 coupe
--    quand même largement.
drop policy if exists "scores_insert_public" on public.scores;

create policy "scores_insert_public"
  on public.scores
  for insert
  to anon, authenticated
  with check (
    score >= -200
    and score <= 350
    and pseudo is not null
    and length(pseudo) between 1 and 40
    and (nom    is null or length(nom)    <= 80)
    and (agence is null or length(agence) <= 120)
    and (nb_parties  is null or nb_parties  = 1)
    and (nb_reponses is null or nb_reponses between 0 and 200)
    and (duree_s     is null or duree_s     between 0 and 600)
  );

-- ------------------------------------------------------------
--  Vue de détection des parties suspectes
-- ------------------------------------------------------------
--  ATTENTION : nb_reponses et duree_s sont déclarés par le
--  navigateur. Un bot peut donc les falsifier. Cette vue repère
--  les tricheurs négligents, pas les déterminés.
--  Le seul contrôle fiable serait une validation côté serveur.

create or replace view public.scores_suspects as
select
  id, pseudo, nom, agence, score, nb_reponses, duree_s, created_at,
  case
    when nb_reponses is null                     then 'sans télémétrie'
    when nb_reponses > 70                        then 'cadence impossible'
    when duree_s > 0 and nb_reponses::numeric / duree_s > 0.75
                                                 then 'plus de 0,75 réponse/s'
    when score > 250                             then 'score très élevé'
  end as motif
from public.scores
where nb_reponses is null
   or nb_reponses > 70
   or (duree_s > 0 and nb_reponses::numeric / duree_s > 0.75)
   or score > 250
order by score desc;

-- ------------------------------------------------------------
--  Vérification
-- ------------------------------------------------------------
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'scores'
order by ordinal_position;

select policyname, cmd from pg_policies
where schemaname = 'public' and tablename = 'scores'
order by policyname;
