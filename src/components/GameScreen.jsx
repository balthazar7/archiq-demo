import { useMemo, useState } from 'react'
import { useGameLogic } from '../hooks/useGameLogic'
import { GAME_CONFIG } from '../config'
import { categories } from '../data/categories'
import { CATEGORY_META, ACCENT_COLOR } from '../branding'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function fmtCombo(c) {
  return `×${parseFloat(c.toFixed(2))}`
}

export function GameScreen({ playerName, onGameEnd }) {
  const { currentQuestion, score, timeLeft, feedback, submitAnswer, combo, comboLost } =
    useGameLogic(playerName, onGameEnd)

  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const handleAnswer = (answer) => {
    if (feedback) return
    setSelectedAnswer(answer)
    submitAnswer(answer)
  }

  useMemo(() => { setSelectedAnswer(null) }, [currentQuestion.id]) // eslint-disable-line

  const timerPct = (timeLeft / GAME_CONFIG.GAME_DURATION_SECONDS) * 100
  const timerBarColor  = timeLeft > 40 ? '#22c55e' : timeLeft > 20 ? '#f59e0b' : '#ef4444'
  const timerTextColor = timeLeft > 40 ? 'text-green-600' : timeLeft > 20 ? 'text-amber-600' : 'text-red-500'

  const currentCategory = categories.find((c) => c.id === currentQuestion.categoryId)
  const meta = currentQuestion.categoryId ? CATEGORY_META[currentQuestion.categoryId] : null

  const shuffledAnswers = useMemo(
    () => shuffleArray([
      currentQuestion.correctAnswer,
      currentQuestion.wrongAnswers[0],
      currentQuestion.wrongAnswers[1],
    ]),
    [currentQuestion.id], // eslint-disable-line
  )

  return (
    <div className="relative flex flex-col h-full min-h-[500px] bg-stone-50">

      {/* ── Header : combo + timer + score ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 bg-white border-b border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-3 max-w-2xl mx-auto w-full">

          {/* Combo */}
          <div className="w-20 text-left">
            <p className="text-stone-400 text-xs uppercase tracking-widest">Combo</p>
            <p className={`font-black text-xl tabular-nums leading-none mt-0.5 ${combo > 1 ? 'text-amber-500' : 'text-stone-300'}`}>
              {combo > 1 ? '🔥 ' : ''}{fmtCombo(combo)}
            </p>
          </div>

          {/* Timer */}
          <span className={`font-mono font-bold text-3xl tabular-nums ${timerTextColor} ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
            {timeLeft}s
          </span>

          {/* Score */}
          <div className="text-right w-20">
            <p className="text-stone-400 text-xs uppercase tracking-widest">Score</p>
            <p className="font-black text-2xl tabular-nums" style={{ color: ACCENT_COLOR }}>
              {score.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${timerPct}%`, backgroundColor: timerBarColor }}
          />
        </div>
      </div>

      {/* ── Zone question ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-2xl">

          {/* Badge catégorie */}
          {currentCategory && meta && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border"
                style={{
                  backgroundColor: meta.colorHex + '18',
                  borderColor: meta.colorHex + '50',
                }}
              >
                <img
                  src={meta.logo}
                  alt={currentCategory.name}
                  className="w-7 h-7 object-contain flex-shrink-0"
                />
                <span
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: meta.colorHex }}
                >
                  {currentCategory.name}
                </span>
              </div>
            </div>
          )}

          {/* Image de la question (catégorie Visuels) */}
          {currentQuestion.imageUrl && (
            <div className="flex justify-center mb-5">
              <img
                src={currentQuestion.imageUrl}
                alt="Visuel de la question"
                className="max-h-56 max-w-full rounded-xl object-contain shadow-md border border-stone-200"
              />
            </div>
          )}

          {/* Question */}
          <p className="text-stone-900 text-xl sm:text-2xl font-semibold text-center leading-snug mb-8 min-h-[4rem]">
            {currentQuestion.question}
          </p>

          {/* Boutons QCM */}
          <div className="flex flex-col gap-3">
            {shuffledAnswers.map((answer) => {
              const isCorrect = answer === currentQuestion.correctAnswer
              const isSelected = answer === selectedAnswer

              let className = 'w-full px-5 py-4 rounded-xl border-2 text-left font-medium text-base transition-all flex items-center justify-between gap-3 '

              if (!feedback) {
                className += 'bg-white border-stone-200 text-stone-800 hover:border-stone-400 hover:shadow-sm cursor-pointer'
              } else if (isCorrect) {
                className += 'bg-green-50 border-green-500 text-green-800 font-bold'
              } else if (isSelected) {
                className += 'bg-red-50 border-red-400 text-red-800'
              } else {
                className += 'bg-stone-50 border-stone-100 text-stone-400 cursor-not-allowed'
              }

              return (
                <button
                  key={answer}
                  onClick={() => handleAnswer(answer)}
                  disabled={!!feedback}
                  className={className}
                >
                  <span>{answer}</span>
                  {feedback && isCorrect  && <span className="flex-shrink-0 text-green-600 font-bold">✓</span>}
                  {feedback && isSelected && !isCorrect && <span className="flex-shrink-0 text-red-500 font-bold">✗</span>}
                </button>
              )
            })}
          </div>

          {/* Message feedback */}
          {feedback && (
            <div className="text-center mt-4">
              <p className={`font-bold text-lg ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
                {feedback === 'correct'
                  ? `Bonne réponse ! +${parseFloat((combo - 0.15).toFixed(2))} pt`
                  : 'Mauvaise réponse −0.23 pt'}
              </p>
              {feedback === 'incorrect' && comboLost && (
                <p className="text-amber-500 font-bold text-sm mt-1 animate-pulse">
                  💥 Combo perdu !
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
