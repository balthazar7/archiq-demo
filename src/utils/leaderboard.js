import { supabase } from '../supabaseClient'
import { GAME_CONFIG } from '../config'

const PENDING_KEY = 'archiq-pending-scores'
const MAX_ATTEMPTS = 3

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(GAME_CONFIG.LEADERBOARD_TOP_N)
  if (error) console.error('getLeaderboard:', error)
  return data ?? []
}

export async function getTotalGamesCount() {
  const { count, error } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })
  if (error) console.error('getTotalGamesCount:', error)
  return count ?? 0
}

export async function getPlayerRank(score) {
  const [{ count: aboveCount }, total] = await Promise.all([
    supabase
      .from('scores')
      .select('*', { count: 'exact', head: true })
      .gt('score', score),
    getTotalGamesCount(),
  ])
  return { rank: (aboveCount ?? 0) + 1, total }
}

/* ── File d'attente locale ─────────────────────────────────── */
/* Un score qui n'a pas pu partir (réseau coupé, onglet fermé,
   téléphone verrouillé…) est gardé ici et réexpédié au prochain
   chargement de l'app, au lieu d'être perdu silencieusement.   */

function readPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writePending(list) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list))
  } catch {
    /* quota / mode privé : on ignore */
  }
}

function rememberPending(row) {
  const list = readPending()
  // garde-fou : pas plus de 20 scores en attente
  writePending([...list.slice(-19), row])
}

/* ── Envoi de la partie ────────────────────────────────────── */
/* Le score n'est plus envoyé : on transmet le détail de la partie,
   et l'Edge Function `submit-score` recalcule le score elle-même.
   L'insertion directe dans `scores` est révoquée côté base, donc
   une requête forgée ne peut plus inscrire un score arbitraire.  */

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/** Ouvre une session de jeu. À appeler au démarrage de la partie. */
export async function startGameSession() {
  try {
    const { data, error } = await supabase.functions.invoke('start-game', { body: {} })
    if (error || !data?.sessionId) return null
    return data.sessionId
  } catch {
    return null
  }
}

async function postGame(payload) {
  try {
    const { data, error } = await supabase.functions.invoke('submit-score', {
      body: payload,
    })
    if (!error && data?.ok) return { ok: true }

    // 400 = requête malformée, 403 = session inconnue/expirée,
    // 409 = session déjà utilisée, 422 = partie refusée.
    // Aucun de ces cas ne s'arrangera en réessayant.
    const status = error?.context?.status
    if (status === 400 || status === 403 || status === 409 || status === 422) {
      console.error('partie refusée:', data?.detail || error?.message)
      return { ok: false, definitif: true }
    }
    return { ok: false, definitif: false }
  } catch {
    return { ok: false, definitif: false }
  }
}

/**
 * Envoie la partie jouée. 3 tentatives espacées ; en cas d'échec
 * réseau la partie est gardée en local et renvoyée plus tard
 * (la session reste valable 24 h côté serveur).
 * @returns {Promise<boolean>} true si le score est bien en base.
 */
export async function submitGame(payload) {
  // Si l'ouverture de session avait échoué, on tente ici en secours.
  const body = payload.sessionId
    ? payload
    : { ...payload, sessionId: await startGameSession() }

  if (!body.sessionId) {
    rememberPending(body)
    return false
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await postGame(body)
    if (res.ok) return true
    if (res.definitif) return false
    if (attempt < MAX_ATTEMPTS) await wait(attempt * 800)
  }

  rememberPending(body)
  return false
}

/** Réessaie l'envoi d'une partie précise (bouton « Réessayer »). */
export async function retryPendingScore(payload) {
  const res = await postGame(payload)
  if (res.ok) {
    writePending(readPending().filter((r) => r.sessionId !== payload.sessionId))
  }
  return res.ok
}

/** Réexpédie les parties restées en attente. Appelé au démarrage. */
export async function flushPendingScores() {
  const list = readPending()
  if (list.length === 0) return

  const stillPending = []
  for (const body of list) {
    // Les entrées laissées par l'ancienne version du site ne
    // contiennent pas le détail de la partie : le serveur ne peut
    // pas les valider. On les abandonne plutôt que de les réessayer
    // à chaque chargement.
    if (!Array.isArray(body?.answers) || !body.sessionId) continue

    const res = await postGame(body)
    if (!res.ok && !res.definitif) stillPending.push(body)
  }
  writePending(stillPending)
}
