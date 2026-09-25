import { useState, useEffect, useCallback, useRef } from 'react'
import { getAllDemoQuestions, isCorrect } from '../data/questions'
import { GAME_CONFIG } from '../config'

export function useGameLogic(_playerName, onGameEnd) {
  const [questions] = useState(() => getAllDemoQuestions())

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.GAME_DURATION_SECONDS)
  const [feedback, setFeedback] = useState(null)
  const [isActive, setIsActive] = useState(true)
  const [comboCount, setComboCount] = useState(0)
  const [comboLost, setComboLost] = useState(false)

  const scoreRef = useRef(0)
  const isActiveRef = useRef(true)
  const comboCountRef = useRef(0)

  // Le détail de la partie : c'est lui qui part au serveur, pas le
  // score. Le serveur rejoue cette liste et recalcule le score.
  const replayRef = useRef([])
  const startedAtRef = useRef(Date.now())

  useEffect(() => {
    if (!isActive) return

    if (timeLeft <= 0) {
      isActiveRef.current = false
      setIsActive(false)
      onGameEnd(scoreRef.current, replayRef.current)
      return
    }

    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft, isActive, onGameEnd])

  const submitAnswer = useCallback(
    (selected) => {
      if (!isActiveRef.current || feedback !== null) return

      const question = questions[currentIndex % questions.length]
      const correct = isCorrect(question, selected)
      replayRef.current.push({
        q: question.id,
        a: selected,
        t: Date.now() - startedAtRef.current,
      })

      if (correct) {
        const multiplier = 1 + comboCountRef.current * 0.15
        const pts = Math.round(multiplier * 100) / 100
        scoreRef.current = Math.round((scoreRef.current + pts) * 100) / 100
        setScore(scoreRef.current)
        comboCountRef.current += 1
        setComboCount(comboCountRef.current)
        setComboLost(false)
        setFeedback('correct')
      } else {
        const wasCombo = comboCountRef.current > 0
        scoreRef.current = Math.round((scoreRef.current - 0.23) * 100) / 100
        setScore(scoreRef.current)
        comboCountRef.current = 0
        setComboCount(0)
        setComboLost(wasCombo)
        setFeedback('incorrect')
      }

      setTimeout(() => {
        setFeedback(null)
        setComboLost(false)
        setCurrentIndex((i) => i + 1)
      }, GAME_CONFIG.FEEDBACK_DURATION_MS)
    },
    [feedback, questions, currentIndex],
  )

  return {
    currentQuestion: questions[currentIndex % questions.length],
    score,
    timeLeft,
    feedback,
    submitAnswer,
    isActive,
    combo: 1 + comboCount * 0.15,
    comboLost,
  }
}
