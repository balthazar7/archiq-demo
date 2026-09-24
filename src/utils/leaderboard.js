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

/* ── Insertion ─────────────────────────────────────────────── */

function buildRow({ playerName, nom, agence, score }) {
  return {
    pseudo: playerName,
    nom: nom || null,
    agence: agence || null,
    score,
    nb_parties: 1,
  }
}

async function insertRow(row) {
  const { error } = await supabase.from('scores').insert(row)
  if (error) {
    console.error('addScore error:', error.message, error.details, error.hint)
    return false
  }
  return true
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Enregistre un score, avec 3 tentatives espacées.
 * En cas d'échec le score est mis de côté dans le localStorage.
 * @returns {Promise<boolean>} true si le score est bien en base.
 */
export async function addScore(payload) {
  const row = buildRow(payload)

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (await insertRow(row)) return true
    if (attempt < MAX_ATTEMPTS) await wait(attempt * 800)
  }

  rememberPending(row)
  return false
}

/** Réessaie l'envoi d'un score précis (bouton « Réessayer »). */
export async function retryPendingScore(payload) {
  const row = buildRow(payload)
  const ok = await insertRow(row)
  if (ok) {
    writePending(
      readPending().filter(
        (r) => !(r.pseudo === row.pseudo && r.score === row.score),
      ),
    )
  }
  return ok
}

/** Réexpédie les scores restés en attente. Appelé au démarrage. */
export async function flushPendingScores() {
  const list = readPending()
  if (list.length === 0) return

  const stillPending = []
  for (const row of list) {
    if (!(await insertRow(row))) stillPending.push(row)
  }
  writePending(stillPending)
}
