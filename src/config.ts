export const GAME_CONFIG = {
  // Durée d'une partie en secondes — changer ici pour 30 ou 120
  GAME_DURATION_SECONDS: 120,

  // Durée d'affichage du feedback avant la question suivante (ms)
  FEEDBACK_DURATION_MS: 900,

  // Nombre de scores affichés dans le classement
  LEADERBOARD_TOP_N: 5,

  // Clé de stockage localStorage
  LEADERBOARD_STORAGE_KEY: 'grand-quiz-leaderboard',
} as const
