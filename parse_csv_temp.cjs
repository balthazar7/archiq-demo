/**
 * Script temporaire — parse les CSV et affiche les questions au format TypeScript.
 * Supprimer ce fichier après génération.
 */
const fs = require('fs')

function parseCSVFile(filepath, categoryId, prefix) {
  const raw = fs.readFileSync(filepath, 'utf8')
  const lines = raw.split('\n').slice(1) // skip header
  const results = []

  lines.forEach((line, idx) => {
    line = line.trim()
    if (!line) return

    // Enlever les guillemets externes si toute la ligne est quotée
    if (line.startsWith('"') && line.endsWith('"')) {
      line = line.slice(1, -1)
    }

    // Remplacer les guillemets doublés (CSV escaped quotes) par un placeholder
    line = line.replace(/""/g, '\x00QUOTE\x00')

    // Chercher la fin de la question : ?, ou !,
    const qMatch = line.match(/^(.*?[?!])\s*,\s*/)
    if (!qMatch) return

    const question = qMatch[1].replace(/\x00QUOTE\x00/g, '"').trim()
    const rest = line.slice(qMatch[0].length)

    // Extraire la réponse (peut être quotée avec \x00QUOTE\x00)
    let answer
    if (rest.startsWith('\x00QUOTE\x00')) {
      // Réponse entre guillemets
      const closeIdx = rest.indexOf('\x00QUOTE\x00', 1)
      answer = closeIdx !== -1
        ? rest.slice('\x00QUOTE\x00'.length, closeIdx)
        : rest.slice('\x00QUOTE\x00'.length).split(',')[0]
    } else {
      answer = rest.split(',')[0]
    }
    answer = answer.replace(/\x00QUOTE\x00/g, '"').trim()

    if (!question || !answer) return

    const id = `${prefix}${idx + 1}`
    results.push({ id, categoryId, question, answer })
  })

  return results
}

const hp = parseCSVFile(
  'TRIVIAL ARCHI - 1 - H&P.csv',
  'cat-1',
  'hp'
)

const archi = parseCSVFile(
  'TRIVIAL ARCHI - 3 - A&A Iconique.csv',
  'cat-3',
  'ai'
)

const all = [...hp, ...archi]

// Afficher au format TypeScript
const lines = all.map(q => {
  const question = q.question.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
  const answer = q.answer.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
  return `  {
    id: '${q.id}',
    categoryId: '${q.categoryId}',
    question: \`${question}\`,
    answer: \`${answer}\`,
  },`
})

console.log(`// ── Histoire et Patrimoine (${hp.length} questions) ─────────────────────────────`)
hp.forEach(q => {
  const question = q.question.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
  const answer = q.answer.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
  console.log(`  {
    id: '${q.id}',
    categoryId: '${q.categoryId}',
    question: \`${question}\`,
    answer: \`${answer}\`,
  },`)
})

console.log(`\n// ── Architecture Iconique (${archi.length} questions) ─────────────────────────────`)
archi.forEach(q => {
  const question = q.question.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
  const answer = q.answer.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
  console.log(`  {
    id: '${q.id}',
    categoryId: '${q.categoryId}',
    question: \`${question}\`,
    answer: \`${answer}\`,
  },`)
})

console.error(`\nTotal: ${hp.length} H&P + ${archi.length} Archi = ${all.length} questions`)
