import { useEffect, useState } from 'react'
import { Leaderboard } from './Leaderboard'
import { PaperGamePromoCard } from './PaperGamePromoCard'
import { getPlayerRank } from '../utils/leaderboard'
import { ACCENT_COLOR } from '../branding'

function ordinal(n) {
  if (n === 1) return '1er'
  return `${n}e`
}

export function ResultScreen({ playerName, score, leaderboardKey, onPlayAgain, onHome }) {
  const medal   = score >= 10 ? '🏆' : score >= 6 ? '🥈' : score >= 3 ? '🥉' : '💪'
  const message = score >= 10 ? 'Impressionnant !' : score >= 6 ? 'Très bien joué !' : score >= 3 ? 'Pas mal !' : 'Continuez à vous entraîner !'

  const [rankData, setRankData] = useState({ rank: 1, total: 0 })

  useEffect(() => {
    getPlayerRank(score).then(setRankData)
  }, [score])

  const { rank, total } = rankData

  return (
    <div className="flex flex-col items-center justify-start px-4 py-10 min-h-full bg-stone-50">
      <div className="w-full max-w-md">

        {/* Carte résultat */}
        <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center mb-6 shadow-md">
          <p className="text-stone-400 text-sm uppercase tracking-widest mb-2">
            🎯 Quiz Démo · Histoire & Architecture
          </p>
          <p className="text-stone-700 text-xl font-semibold mb-4">{playerName}</p>

          <div className="text-7xl mb-4">{medal}</div>

          <p className="text-6xl font-black tabular-nums mb-2" style={{ color: ACCENT_COLOR }}>{score.toFixed(2)}</p>
          <p className="text-stone-500 text-lg mb-1">
            pt{score > 1 ? 's' : ''}
          </p>
          <p className="font-semibold text-lg mb-4" style={{ color: ACCENT_COLOR }}>{message}</p>

          {/* Classement personnel */}
          {total > 0 && (
            <div
              className="mt-4 px-4 py-3 rounded-2xl border"
              style={{ backgroundColor: ACCENT_COLOR + '0f', borderColor: ACCENT_COLOR + '30' }}
            >
              <p className="text-sm font-bold" style={{ color: ACCENT_COLOR }}>
                {rank === 1
                  ? '🥇 Vous êtes en tête du classement !'
                  : `Vous êtes classé ${ordinal(rank)} sur ${total} joueur${total > 1 ? 's' : ''}`}
              </p>
            </div>
          )}
        </div>

        {/* Encart promo */}
        <div className="mb-6">
          <PaperGamePromoCard />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-8">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 rounded-2xl text-white font-black text-xl transition-all shadow-md hover:scale-[1.01]"
            style={{ backgroundColor: ACCENT_COLOR }}
          >
            Rejouer
          </button>
          <button
            onClick={onHome}
            className="w-full py-4 rounded-2xl border-2 border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-400 font-semibold text-lg transition-all"
          >
            Accueil
          </button>
        </div>

        {/* Classement Top 5 — mobile uniquement */}
        <div className="lg:hidden">
          <Leaderboard refreshKey={leaderboardKey} />
        </div>
      </div>
    </div>
  )
}
