/* Génère la table de vérité des réponses pour l'Edge Function,
   à partir de src/data/questions.js (source unique).

   Le serveur n'a besoin que des empreintes : il recalcule
   fnv1a(SALT + id + '|' + réponse) et compare. Le texte des
   bonnes réponses n'est jamais dupliqué.

   Usage : node scripts/gen-answers.cjs
*/
const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '..', 'src', 'data', 'questions.js')
const OUT = path.join(__dirname, '..', 'supabase', 'functions', '_shared', 'answers.json')

const src = fs.readFileSync(SRC, 'utf8')

const re = /id:\s*["']([^"']+)["'][\s\S]*?options:\s*(\[[\s\S]*?\]),\s*\n?\s*answerHash:\s*(\d+)/g

const answers = {}
let m
let count = 0
while ((m = re.exec(src))) {
  const id = m[1]
  let options
  try {
    options = eval(m[2]) // eslint-disable-line no-eval
  } catch {
    throw new Error(`options illisibles pour ${id}`)
  }
  const hash = Number(m[3])

  if (answers[id]) throw new Error(`id dupliqué : ${id}`)
  if (!Array.isArray(options) || options.length !== 3) {
    throw new Error(`${id} : ${options && options.length} options au lieu de 3`)
  }

  answers[id] = { h: hash, n: options.length }
  count++
}

if (count === 0) throw new Error('aucune question trouvée')

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(answers, null, 0) + '\n')
console.log(`OK ${count} questions -> ${path.relative(process.cwd(), OUT)}`)
