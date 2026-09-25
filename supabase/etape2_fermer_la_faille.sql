-- ============================================================
--  ÉTAPE 2 / 2 — Fermeture de la faille
--  À lancer UNIQUEMENT APRÈS que le nouveau site soit en ligne
--  et qu'une partie de test se soit bien enregistrée.
--  Supabase > SQL Editor > New query > Run
-- ============================================================
--  Ce script retire le droit d'insérer directement dans `scores`.
--  C'est LUI qui ferme l'injection par curl.
--
--  Si vous le lancez trop tôt (site pas encore déployé), les
--  parties ne s'enregistreront plus : l'ancien site insère en
--  direct. Elles seront gardées dans le navigateur des joueurs
--  et renvoyées ensuite, mais autant faire les choses dans
--  l'ordre.
--
--  Pour revenir en arrière en cas de souci, voir tout en bas.
-- ============================================================

-- LE POINT CENTRAL : plus personne n'insère directement un score.
drop policy if exists "scores_insert_public" on public.scores;

-- La lecture du classement reste publique.
drop policy if exists "scores_select_public" on public.scores;
create policy "scores_select_public"
  on public.scores
  for select
  to anon, authenticated
  using (true);

-- Désormais aucune policy insert/update/delete : la table n'est
-- plus modifiable qu'avec la clé service_role, détenue seulement
-- par les Edge Functions start-game et submit-score.

-- ------------------------------------------------------------
--  Vérification — attendu : UNE SEULE ligne
--    scores | scores_select_public | SELECT
-- ------------------------------------------------------------
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public' and tablename in ('scores', 'game_sessions')
order by tablename, policyname;

-- ============================================================
--  RETOUR ARRIÈRE (seulement si les scores ne passent plus)
-- ============================================================
--  Décommenter et exécuter pour rouvrir l'insertion directe :
--
--  create policy "scores_insert_public"
--    on public.scores for insert to anon, authenticated
--    with check (
--      score >= -200 and score <= 500
--      and pseudo is not null and length(pseudo) between 1 and 40
--      and (nom is null or length(nom) <= 80)
--      and (agence is null or length(agence) <= 120)
--      and (nb_parties is null or nb_parties = 1)
--    );
