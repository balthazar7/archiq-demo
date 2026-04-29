import { supabase } from '../supabaseClient'

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(5)
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

export async function addScore({ playerName, score }) {
  const { error } = await supabase
    .from('scores')
    .insert({ pseudo: playerName, score })
  if (error) console.error('addScore:', error)
}
