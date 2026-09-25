-- ============================================================
--  ÉTAPE 2 / 2 — Fermeture de la faille  (feu vert donné)
--  Supabase > SQL Editor > New query > Run
-- ============================================================
--  Vérifications faites avant de vous donner ce script :
--    - archiq-demo.vercel.app sert bien le nouveau bundle
--    - start-game et submit-score répondent en production
--    - le chemin exact du navigateur (supabase-js invoke) marche
--    - une partie truquée est refusée, une partie honnête passe
--
--  Ce script retire le droit d'insérer directement dans `scores`.
--  C'est LUI qui ferme l'injection par curl.
--
--  Retour arrière en bas du fichier si besoin.
-- ============================================================

-- 1. Ménage : lignes laissées par mes tests de sécurité
delete from public.scores
where pseudo in ('TEST-INJECTION', 'TEST-SECURITE', 'TEST-TRICHE',
                 '__rls_test__', '__cheat__');

-- 2. LE POINT CENTRAL : plus personne n'insère directement un score.
drop policy if exists "scores_insert_public" on public.scores;

-- 3. La lecture du classement reste publique.
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

-- Et le classement, pour contrôle
select pseudo, score, nb_reponses, duree_s, created_at
from public.scores
order by score desc
limit 5;

-- ============================================================
--  RETOUR ARRIÈRE (seulement si les scores ne passent plus)
-- ============================================================
--  create policy "scores_insert_public"
--    on public.scores for insert to anon, authenticated
--    with check (
--      score >= -200 and score <= 500
--      and pseudo is not null and length(pseudo) between 1 and 40
--      and (nom is null or length(nom) <= 80)
--      and (agence is null or length(agence) <= 120)
--      and (nb_parties is null or nb_parties = 1)
--    );
