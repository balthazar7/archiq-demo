import { useEffect, useState } from 'react'
import type { LeaderboardEntry } from '../types'
import { getLeaderboard } from '../utils/leaderboard'
import { ACCENT_COLOR } from '../branding'

interface Props {
  refreshKey?: number
}

const MEDALS = ['🥇', '🥈', '🥉']

export function Leaderboard({ refreshKey = 0 }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    setEntries(getLeaderboard())
  }, [refreshKey])

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
      <h2 className="text-stone-900 font-bold text-base mb-4 flex items-center gap-2">
        🏆 <span>Classement Top 5</span>
      </h2>

      {entries.length === 0 ? (
        <p className="text-stone-400 text-sm text-center py-4">
          Aucun score enregistré.<br />Soyez le premier !
        </p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry, i) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl px-3 py-2"
            >
              <span className="text-lg w-7 text-center flex-shrink-0">
                {MEDALS[i] ?? `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 truncate text-sm">{entry.playerName}</p>
                <p className="text-xs text-stone-400 truncate">{entry.categoryName}</p>
              </div>
              <span className="font-black text-lg flex-shrink-0" style={{ color: ACCENT_COLOR }}>
                {entry.score}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
