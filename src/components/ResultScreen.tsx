import { Leaderboard } from './Leaderboard'
import { PaperGamePromoCard } from './PaperGamePromoCard'
import { ACCENT_COLOR } from '../branding'

interface Props {
  playerName: string
  score: number
  leaderboardKey: number
  onPlayAgain: () => void
  onHome: () => void
}

export function ResultScreen({ playerName, score, leaderboardKey, onPlayAgain, onHome }: Props) {
  const medal   = score >= 10 ? '🏆' : score >= 6 ? '🥈' : score >= 3 ? '🥉' : '💪'
  const message = score >= 10 ? 'Impressionnant !' : score >= 6 ? 'Très bien joué !' : score >= 3 ? 'Pas mal !' : 'Continuez à vous entraîner !'

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

          <p className="text-6xl font-black tabular-nums mb-2" style={{ color: ACCENT_COLOR }}>{score}</p>
          <p className="text-stone-500 text-lg mb-1">
            bonne{score > 1 ? 's' : ''} réponse{score > 1 ? 's' : ''}
          </p>
          <p className="font-semibold text-lg" style={{ color: ACCENT_COLOR }}>{message}</p>
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

        {/* Classement — mobile uniquement */}
        <div className="lg:hidden">
          <Leaderboard refreshKey={leaderboardKey} />
        </div>
      </div>
    </div>
  )
}
