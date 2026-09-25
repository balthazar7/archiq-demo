-- ============================================================
--  Nettoyage des lignes de test
--  Supabase > SQL Editor > New query > Run
-- ============================================================
--  À relancer après chaque `npm run check:production`, qui crée
--  deux lignes (TEST-SECURITE et TEST-TRICHE) en vérifiant que
--  le chemin honnête fonctionne toujours.
--
--  Scores concernés : ~6,50 et ~3,45 pts. Ils n'apparaissent pas
--  dans le top 10, ils gonflent seulement le compteur de parties.
-- ============================================================

delete from public.scores
where pseudo in ('TEST-INJECTION', 'TEST-SECURITE', 'TEST-TRICHE',
                 '__rls_test__', '__cheat__');

-- Vérification — attendu : 0
select count(*) as lignes_test_restantes
from public.scores
where pseudo in ('TEST-INJECTION', 'TEST-SECURITE', 'TEST-TRICHE',
                 '__rls_test__', '__cheat__');
