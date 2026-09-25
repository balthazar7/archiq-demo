-- ============================================================
--  À LANCER TOUT DE SUITE
--  Supabase > SQL Editor > New query > Run
-- ============================================================
--  Supprime les lignes créées par les tests de sécurité.
--  L'une d'elles (TEST-INJECTION, 499 pts) est en tête du
--  classement public : c'est la preuve que la faille curl est
--  encore ouverte, et il faut la retirer.
-- ============================================================

-- Aperçu avant suppression
select id, pseudo, score, created_at
from public.scores
where pseudo in ('TEST-INJECTION', 'TEST-SECURITE', 'TEST-TRICHE', '__rls_test__', '__cheat__')
order by score desc;

-- Suppression
delete from public.scores
where pseudo in ('TEST-INJECTION', 'TEST-SECURITE', 'TEST-TRICHE', '__rls_test__', '__cheat__');

-- Vérification — attendu : 0
select count(*) as lignes_test_restantes
from public.scores
where pseudo in ('TEST-INJECTION', 'TEST-SECURITE', 'TEST-TRICHE', '__rls_test__', '__cheat__');

-- Et le vrai classement, pour contrôle
select pseudo, score, created_at
from public.scores
order by score desc
limit 5;
