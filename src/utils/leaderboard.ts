import type { LeaderboardEntry } from '../types'
import { GAME_CONFIG } from '../config'

const KEY = GAME_CONFIG.LEADERBOARD_STORAGE_KEY

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as LeaderboardEntry[]
  } catch {
    return []
  }
}

export function addScore(entry: Omit<LeaderboardEntry, 'id' | 'date'>): void {
  const existing = getLeaderboard()
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toLocaleDateString('fr-FR'),
  }
  // Trier par score décroissant et ne garder que le top N
  const updated = [...existing, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, GAME_CONFIG.LEADERBOARD_TOP_N)

  localStorage.setItem(KEY, JSON.stringify(updated))
}
