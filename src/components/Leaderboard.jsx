import { useEffect, useState } from 'react'
import { getLeaderboard, getTotalGamesCount } from '../utils/leaderboard'
import { ACCENT_COLOR } from '../branding'

const MEDALS = ['🥇', '🥈', '🥉']

export function Leaderboard({ refreshKey = 0 }) {
  const [entries, setEntries]       = useState([])
  const [totalGames, setTotalGames] = useState(0)

  useEffect(() => {
    async function load() {
      const [data, count] = await Promise.all([getLeaderboard(), getTotalGamesCount()])
      setEntries(data)
      setTotalGames(count)
    }
    load()
  }, [refreshKey])

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
      <div className="mb-4">
        <h2 className="text-stone-900 font-bold text-base flex items-center gap-2">
          🏆 <span>Classement Top 5</span>
        </h2>
        {totalGames > 0 && (
          <p className="text-stone-400 text-xs mt-0.5">{totalGames} partie{totalGames > 1 ? 's' : ''} jouée{totalGames > 1 ? 's' : ''}</p>
        )}
      </div>

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
                <p className="font-semibold text-stone-900 truncate text-sm">{entry.pseudo}</p>
                <p className="text-xs text-stone-400 truncate">
                  {new Date(entry.created_at).toLocaleDateString('fr-FR')}
                </p>
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
