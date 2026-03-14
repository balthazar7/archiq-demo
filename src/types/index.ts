export interface Question {
  id: string
  categoryId: string
  question: string
  correctAnswer: string
  wrongAnswers: [string, string]
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  isActive: boolean
}

export interface LeaderboardEntry {
  id: string
  playerName: string
  score: number
  categoryId: string
  categoryName: string
  date: string
}

export type GamePhase = 'home' | 'naming' | 'playing' | 'results'
export type FeedbackType = 'correct' | 'incorrect' | null
