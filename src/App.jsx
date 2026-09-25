import { useState, useCallback, useEffect, useRef } from 'react'
import { categories } from './data/categories'
import { BRAND, FONTS, ACCENT_COLOR } from './branding'
import { GameLayout } from './components/GameLayout'
import { PlayerNameInput } from './components/PlayerNameInput'
import { CountdownScreen } from './components/CountdownScreen'
import { GameScreen } from './components/GameScreen'
import { ResultScreen } from './components/ResultScreen'
import { PaperGamePromoCard } from './components/PaperGamePromoCard'
import { ProContactCard } from './components/ProContactCard'
import { submitGame, flushPendingScores, startGameSession } from './utils/leaderboard'

export default function App() {
  const [phase, setPhase] = useState('home')
  const [playerName, setPlayerName] = useState('')
  const [playerNom, setPlayerNom] = useState('')
  const [playerAgence, setPlayerAgence] = useState('')
  const [lastScore, setLastScore] = useState(0)
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const [gameKey, setGameKey] = useState(0)
  const [scoreSaved, setScoreSaved] = useState(true)
  const [lastPayload, setLastPayload] = useState(null)
  const sessionIdRef = useRef(null)

  // Réexpédie les scores restés en attente lors d'une session précédente
  useEffect(() => {
    flushPendingScores().then(() => setLeaderboardKey((k) => k + 1))
  }, [])

  const handleNameSubmit = useCallback((name, nom, agence) => {
    setPlayerName(name)
    setPlayerNom(nom)
    setPlayerAgence(agence)
    setPhase('countdown')
  }, [])

  const handleCountdownEnd = useCallback(() => {
    setGameKey((k) => k + 1)
    setPhase('playing')
  }, [])

  // La session s'ouvre pendant le compte à rebours : le serveur sait
  // ainsi qu'une partie a réellement commencé avant d'accepter un score.
  const handleNameSubmitWithSession = useCallback((name, nom, agence) => {
    sessionIdRef.current = null
    startGameSession().then((id) => { sessionIdRef.current = id })
    handleNameSubmit(name, nom, agence)
  }, [handleNameSubmit])

  const handleGameEnd = useCallback(async (score, replay = []) => {
    setLastScore(score)
    setScoreSaved(true)
    setPhase('results')

    const payload = {
      sessionId: sessionIdRef.current,
      pseudo: playerName,
      nom: playerNom || null,
      agence: playerAgence || null,
      answers: replay,
    }
    setLastPayload(payload)

    const ok = await submitGame(payload)
    setScoreSaved(ok)
    setLeaderboardKey((k) => k + 1)
  }, [playerName, playerNom, playerAgence])

  const handlePlayAgain = useCallback(() => setPhase('naming'), [])
  const handleHome      = useCallback(() => setPhase('home'),   [])

  return (
    <GameLayout categories={categories} leaderboardKey={leaderboardKey}>

      {/* ── Écran d'accueil ── */}
      {phase === 'home' && (
        <div className="flex flex-col items-center justify-center min-h-full px-4 py-12 gap-8 bg-stone-50">

          {/* Logo + titre — mobile uniquement */}
          <div className="lg:hidden flex flex-col items-center gap-2 text-center">
            <img
              src={BRAND.logoPrincipal}
              alt="Archi Q logo"
              className="w-24 h-24 object-contain rounded-xl shadow-md"
            />
            <h1
              className="text-4xl font-black tracking-tight leading-none"
              style={{ color: ACCENT_COLOR }}
            >
              {BRAND.name}
            </h1>
            <p
              className="text-stone-500 text-base"
              style={{ fontFamily: FONTS.subtitle }}
            >
              {BRAND.subtitle}
            </p>
          </div>

          {/* Bouton Jouer */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-stone-400 text-sm">
              {BRAND.demoQuestionCount} questions disponibles sur {BRAND.totalQuestionCount} en version papier
            </p>
            <button
              onClick={() => setPhase('naming')}
              className="px-16 py-5 rounded-2xl text-white font-black text-2xl tracking-tight transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              Jouer
            </button>
          </div>

          {/* Encart promo */}
          <PaperGamePromoCard />

          {/* Encart contact pro */}
          <ProContactCard />
        </div>
      )}

      {/* ── Saisie du prénom ── */}
      {phase === 'naming' && (
        <PlayerNameInput onSubmit={handleNameSubmitWithSession} onBack={handleHome} />
      )}

      {/* ── Compte à rebours ── */}
      {phase === 'countdown' && (
        <CountdownScreen onEnd={handleCountdownEnd} />
      )}

      {/* ── Partie en cours ── */}
      {phase === 'playing' && (
        <GameScreen key={gameKey} playerName={playerName} onGameEnd={handleGameEnd} />
      )}

      {/* ── Résultats ── */}
      {phase === 'results' && (
        <ResultScreen
          playerName={playerName}
          nom={playerNom}
          agence={playerAgence}
          score={lastScore}
          scoreSaved={scoreSaved}
          payload={lastPayload}
          onScoreSaved={() => {
            setScoreSaved(true)
            setLeaderboardKey((k) => k + 1)
          }}
          leaderboardKey={leaderboardKey}
          onPlayAgain={handlePlayAgain}
          onHome={handleHome}
        />
      )}
    </GameLayout>
  )
}
