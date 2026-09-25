/* Vérifie que le score calculé par le client et celui recalculé par
   l'Edge Function donnent le même résultat, sur des parties aléatoires. */

const round2 = (n) => Math.round(n * 100) / 100

// --- formule client (src/hooks/useGameLogic.js) ---
function clientScore(seq) {
  let score = 0, combo = 0
  for (const correct of seq) {
    if (correct) {
      const multiplier = 1 + combo * 0.15
      const pts = Math.round(multiplier * 100) / 100
      score = Math.round((score + pts) * 100) / 100
      combo += 1
    } else {
      score = Math.round((score - 0.23) * 100) / 100
      combo = 0
    }
  }
  return score
}

// --- formule serveur (supabase/functions/submit-score/index.ts) ---
const COMBO_STEP = 0.15, MALUS = 0.23
function serverScore(seq) {
  let score = 0, combo = 0
  for (const correct of seq) {
    if (correct) {
      score = round2(score + round2(1 + combo * COMBO_STEP))
      combo += 1
    } else {
      score = round2(score - MALUS)
      combo = 0
    }
  }
  return score
}

let ko = 0
let maxScore = 0
for (let trial = 0; trial < 20000; trial++) {
  const n = 1 + Math.floor(Math.random() * 140)
  const seq = Array.from({ length: n }, () => Math.random() < 0.75)
  const a = clientScore(seq), b = serverScore(seq)
  if (a !== b) { if (ko < 5) console.log('ECART', n, a, b); ko++ }
  if (a > maxScore) maxScore = a
}
console.log('parties testees        : 20000')
console.log('ecarts client/serveur  :', ko === 0 ? 'AUCUN' : ko)

// plafonds réalistes
for (const n of [40, 50, 60, 65, 75, 90, 133]) {
  const perfect = Array.from({ length: n }, () => true)
  console.log(`  ${String(n).padStart(3)} bonnes reponses d'affilee -> ${clientScore(perfect).toFixed(2)} pts`)
}
process.exit(ko ? 1 : 0)
