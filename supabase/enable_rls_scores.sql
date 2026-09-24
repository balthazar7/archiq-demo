-- ============================================================
--  Sécurisation de la table `scores` (Row-Level Security)
--  DÉJÀ APPLIQUÉ en production le 2026-09-24 (migration
--  `enable_rls_scores`). Conservé ici pour référence / rejeu.
-- ============================================================
--  Contexte : RLS était désactivé, donc n'importe qui disposant
--  de l'URL du projet et de la clé anon (publiée dans le bundle
--  JS du site) pouvait lire, modifier ET SUPPRIMER tous les scores.
--
--  Après ce script :
--    - lecture   : autorisée à tous (le classement est public)
--    - insertion : autorisée à tous, mais avec des garde-fous
--    - update    : interdit
--    - delete    : interdit
--  Seule la clé service_role (côté serveur / dashboard) garde
--  les pleins pouvoirs.
-- ============================================================

alter table public.scores enable row level security;

-- Nettoyage si le script est rejoué
drop policy if exists "scores_select_public"  on public.scores;
drop policy if exists "scores_insert_public"  on public.scores;

-- 1. Lecture publique du classement
create policy "scores_select_public"
  on public.scores
  for select
  to anon, authenticated
  using (true);

-- 2. Insertion publique, encadrée
--    Empêche l'injection de scores absurdes ou de champs géants.
create policy "scores_insert_public"
  on public.scores
  for insert
  to anon, authenticated
  with check (
    score >= -200
    and score <= 500
    and pseudo is not null
    and length(pseudo) between 1 and 40
    and (nom    is null or length(nom)    <= 80)
    and (agence is null or length(agence) <= 120)
    and (nb_parties is null or nb_parties = 1)
  );

-- 3. Aucune policy update/delete => ces opérations sont refusées
--    pour anon et authenticated.

-- ------------------------------------------------------------
--  Vérification
-- ------------------------------------------------------------
select
  relname                as table_name,
  relrowsecurity         as rls_active
from pg_class
where oid = 'public.scores'::regclass;

select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'scores'
order by policyname;
