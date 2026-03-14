import { useState, useEffect, useCallback, useRef } from 'react'
import type { FeedbackType, Question } from '../types'
import { getAllDemoQuestions } from '../data/questions'
import { GAME_CONFIG } from '../config'

interface UseGameLogicReturn {
  currentQuestion: Question
  score: number
  timeLeft: number
  feedback: FeedbackType
  submitAnswer: (selected: string) => void
  isActive: boolean
}

export function useGameLogic(
  _playerName: string,
  onGameEnd: (score: number) => void,
): UseGameLogicReturn {
  // Pool global (cat-1 + cat-3) mélangé une seule fois au montage
  const [questions] = useState<Question[]>(() => getAllDemoQuestions())

  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONFIG.GAME_DURATION_SECONDS)
  const [feedback, setFeedback] = useState<FeedbackType>(null)
  const [isActive, setIsActive] = useState(true)

  const scoreRef = useRef(0)
  const isActiveRef = useRef(true)

  // Décompte du timer
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
    (selected: string) => {
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
