import { GAME_CONFIG } from '../config'

const TOP_KEY   = GAME_CONFIG.LEADERBOARD_STORAGE_KEY
const ALL_KEY   = GAME_CONFIG.LEADERBOARD_STORAGE_KEY + '_all'
const COUNT_KEY = GAME_CONFIG.LEADERBOARD_STORAGE_KEY + '_count'

export function getAllEntries() {
  try {
    const raw = localStorage.getItem(ALL_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function getLeaderboard() {
  return getAllEntries().slice(0, GAME_CONFIG.LEADERBOARD_TOP_N)
}

export function getTotalGamesCount() {
  return parseInt(localStorage.getItem(COUNT_KEY) ?? '0', 10)
}

export function getPlayerRank(score) {
  const all   = getAllEntries()
  const total = getTotalGamesCount()
  const rank  = all.filter((e) => e.score > score).length + 1
  return { rank, total }
}

export function addScore(entry) {
  const existing = getAllEntries()
  const newEntry = {
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toLocaleDateString('fr-FR'),
  }
  const sorted = [...existing, newEntry].sort((a, b) => b.score - a.score)

  localStorage.setItem(ALL_KEY, JSON.stringify(sorted))
  localStorage.setItem(TOP_KEY, JSON.stringify(sorted.slice(0, GAME_CONFIG.LEADERBOARD_TOP_N)))
  localStorage.setItem(COUNT_KEY, String(getTotalGamesCount() + 1))
}
