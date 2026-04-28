import { useState, useEffect, useCallback, useRef } from 'react'
import { getAllDemoQuestions } from '../data/questions'
import { GAME_CONFIG } from '../config'

export function useGameLogic(_playerName, onGameEnd) {
  const [questions] = useState(() => getAllDemoQuestions())

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.GAME_DURATION_SECONDS)
  const [feedback, setFeedback] = useState(null)
  const [isActive, setIsActive] = useState(true)

  const scoreRef = useRef(0)
  const isActiveRef = useRef(true)

  useEffect(() => {
    if (!isActive) return

    if (timeLeft <= 0) {
      isActiveRef.current = false
      setIsActive(false)
      onGameEnd(scoreRef.current)
      return
    }

    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft, isActive, onGameEnd])

  const submitAnswer = useCallback(
    (selected) => {
      if (!isActiveRef.current || feedback !== null) return

      const question = questions[currentIndex % questions.length]
      const correct = selected === question.correctAnswer

      if (correct) {
        scoreRef.current += 1
        setScore((s) => s + 1)
      }

      setFeedback(correct ? 'correct' : 'incorrect')

      setTimeout(() => {
        setFeedback(null)
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
  }
}
