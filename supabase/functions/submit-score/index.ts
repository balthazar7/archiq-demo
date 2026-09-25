// Edge Function : submit-score
//
// Seul écrivain autorisé de la table `scores`.
// Le client n'envoie PLUS son score : il envoie le détail de sa
// partie, et le serveur recalcule le score lui-même.
//
// Une commande curl ne peut donc plus inscrire un score arbitraire :
// il faudrait fournir une partie complète, cohérente et chronométrée,
// adossée à une session ouverte à l'avance et à usage unique.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import answers from '../_shared/answers.json' with { type: 'json' }

const SALT = 'aq7:'

// Doit rester aligné avec src/config.js et src/hooks/useGameLogic.js
const GAME_DURATION_S = 120
const FEEDBACK_MS = 900
const COMBO_STEP = 0.15
const MALUS = 0.23

// Tolérances
const MIN_GAP_MS = 800              // 900 ms côté client, marge pour la gigue
const MAX_TOTAL_MS = (GAME_DURATION_S + 8) * 1000
const MAX_ANSWERS = 200
// 500 = ~75 bonnes réponses d'affilée à 1,6 s chacune. Hors de portée
// d'un humain, et identique au plafond RLS qui était déjà en place :
// aucune régression pour les joueurs. Un plafond plus bas rejetterait
// une très bonne partie honnête (65 réponses = 377 pts).
const MAX_SCORE = 500
const SESSION_MAX_AGE_MS = 24 * 3600 * 1000 // permet le renvoi différé

type Answer = { q: string; a: string; t: number }

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function fnv1a(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** Rejoue la partie et renvoie le score, ou une raison de rejet. */
function replay(list: Answer[]): { score: number; correct: number } | { reason: string } {
  if (list.length > MAX_ANSWERS) return { reason: 'trop de réponses' }

  let score = 0
  let combo = 0
  let correctCount = 0
  let prevT = -Infinity

  for (const [i, item] of list.entries()) {
    if (typeof item?.q !== 'string' || typeof item?.a !== 'string') {
      return { reason: `réponse ${i} malformée` }
    }
    if (typeof item.t !== 'number' || !isFinite(item.t) || item.t < 0) {
      return { reason: `horodatage ${i} invalide` }
    }
    if (item.t > MAX_TOTAL_MS) return { reason: 'partie plus longue que le chrono' }
    if (item.t - prevT < MIN_GAP_MS) return { reason: `cadence impossible à la réponse ${i}` }
    prevT = item.t

    const entry = (answers as Record<string, { h: number; n: number }>)[item.q]
    if (!entry) return { reason: `question inconnue : ${item.q}` }
    if (item.a.length > 300) return { reason: 'réponse anormalement longue' }

    if (fnv1a(SALT + item.q + '|' + item.a) === entry.h) {
      score = round2(score + round2(1 + combo * COMBO_STEP))
      combo += 1
      correctCount += 1
    } else {
      score = round2(score - MALUS)
      combo = 0
    }
  }

  return { score, correct: correctCount }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'méthode non autorisée' }, 405)

  let body: {
    sessionId?: string
    pseudo?: string
    nom?: string | null
    agence?: string | null
    answers?: Answer[]
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'corps illisible' }, 400)
  }

  const { sessionId, pseudo, nom, agence } = body
  const list = body.answers

  if (!sessionId || typeof sessionId !== 'string') return json({ error: 'session manquante' }, 400)
  if (!pseudo || typeof pseudo !== 'string' || pseudo.length > 40) {
    return json({ error: 'pseudo invalide' }, 400)
  }
  if (!Array.isArray(list)) return json({ error: 'réponses manquantes' }, 400)

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // 1. La session doit exister, être à nous, et n'avoir jamais servi.
  //    C'est ce qui empêche de rejouer une partie valide en boucle.
  const { data: session, error: sErr } = await admin
    .from('game_sessions')
    .select('id, created_at, used_at')
    .eq('id', sessionId)
    .maybeSingle()

  if (sErr) return json({ error: 'session illisible' }, 500)
  if (!session) return json({ error: 'session inconnue' }, 403)
  if (session.used_at) return json({ error: 'session déjà utilisée' }, 409)

  const age = Date.now() - new Date(session.created_at).getTime()
  if (age > SESSION_MAX_AGE_MS) return json({ error: 'session expirée' }, 403)

  // 2. Rejeu de la partie
  const result = replay(list)
  if ('reason' in result) {
    await admin.from('game_sessions')
      .update({ used_at: new Date().toISOString(), rejected: result.reason })
      .eq('id', sessionId)
    return json({ error: 'partie refusée', detail: result.reason }, 422)
  }
  if (result.score > MAX_SCORE) {
    await admin.from('game_sessions')
      .update({ used_at: new Date().toISOString(), rejected: 'score hors limites' })
      .eq('id', sessionId)
    return json({ error: 'partie refusée', detail: 'score hors limites' }, 422)
  }

  // 3. Consomme la session AVANT d'écrire : en cas de double envoi
  //    simultané, une seule des deux requêtes passe.
  const { data: claimed, error: cErr } = await admin
    .from('game_sessions')
    .update({ used_at: new Date().toISOString() })
    .eq('id', sessionId)
    .is('used_at', null)
    .select('id')
    .maybeSingle()

  if (cErr) return json({ error: 'session non consommée' }, 500)
  if (!claimed) return json({ error: 'session déjà utilisée' }, 409)

  const durationS = list.length ? Math.round(list[list.length - 1].t / 1000) : 0

  const { error: iErr } = await admin.from('scores').insert({
    pseudo,
    nom: nom || null,
    agence: agence || null,
    score: result.score,
    nb_parties: 1,
    nb_reponses: list.length,
    duree_s: durationS,
  })

  if (iErr) {
    console.error('insert scores:', iErr.message)
    return json({ error: "enregistrement impossible" }, 500)
  }

  return json({ ok: true, score: result.score, correct: result.correct })
})
