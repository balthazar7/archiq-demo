/* Teste la vraie fonction replay() de l'Edge Function, extraite du
   fichier TypeScript (on retire seulement les annotations de type). */
const fs = require('fs')
const path = require('path')

const ROOT = process.argv[2]
const ts = fs.readFileSync(path.join(ROOT, 'supabase/functions/submit-score/index.ts'), 'utf8')
const answers = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'supabase/functions/_shared/answers.json'), 'utf8'))

// --- extraction des constantes + fonctions pures ---
function grab(name, src) {
  const i = src.indexOf(name)
  if (i < 0) throw new Error('introuvable: ' + name)
  let depth = 0, started = false
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') { depth++; started = true }
    else if (src[j] === '}') { depth--; if (started && depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error('non equilibre: ' + name)
}

// on retire d'abord les annotations de type qui contiennent des accolades,
// sinon l'extracteur par equilibrage s'arrete dessus
const tsClean = ts
  .replace(/function replay\(list: Answer\[\]\)[^\n]*\{[ \t]*$/m, 'function replay(list) {')
  .replace(/\(answers as Record<string, \{ h: number; n: number \}>\)/g, 'answers')

const consts = [...ts.matchAll(/^const (MIN_GAP_MS|MAX_TOTAL_MS|MAX_ANSWERS|MAX_SCORE|SALT|GAME_DURATION_S|FEEDBACK_MS|COMBO_STEP|MALUS)\s*=\s*([^\n]+)$/gm)]
  .map((m) => `const ${m[1]} = ${m[2].replace(/\/\/.*$/, '')}`).join('\n')

let code = [
  consts,
  grab('function fnv1a', tsClean).replace(/\(str: string\): number/, '(str)'),
  "const round2 = (n) => Math.round(n * 100) / 100",
  grab('function replay', tsClean),
  'module.exports = { replay, fnv1a, SALT, MAX_SCORE }',
].join('\n\n')

code = code.replace(/answers as Record<string, \{ h: number; n: number \}>/g, 'answers')

const mod = { exports: {} }
new Function('answers', 'module', code)(answers, mod)
const { replay, fnv1a, SALT, MAX_SCORE } = mod.exports

const ids = Object.keys(answers)
// retrouve, pour chaque question, une réponse correcte connue
// (on ne l'a pas en clair : on la fabrique en cherchant la préimage
//  parmi les options du bundle)
const qjs = fs.readFileSync(path.join(ROOT, 'src/data/questions.js'), 'utf8')
const optMap = {}
const re = /id:\s*["']([^"']+)["'][\s\S]*?options:\s*(\[[\s\S]*?\]),\s*\n?\s*answerHash:\s*(\d+)/g
let m
while ((m = re.exec(qjs))) {
  const opts = eval(m[2]) // eslint-disable-line
  optMap[m[1]] = { opts, good: opts.find((o) => fnv1a(SALT + m[1] + '|' + o) === Number(m[3])) }
}

function game(n, { gap = 950, allGood = true } = {}) {
  return Array.from({ length: n }, (_, i) => {
    const id = ids[i % ids.length]
    const e = optMap[id]
    return { q: id, a: allGood ? e.good : e.opts.find((o) => o !== e.good), t: (i + 1) * gap }
  })
}

const T = []
const ok = (name, cond) => T.push([name, cond])

// 1. partie honnête
const honest = replay(game(40))
ok('partie honnete acceptee', !('reason' in honest))
ok('score honnete = 157.00', honest.score === 157)

// 2. attaques
ok('cadence impossible (100ms) refusee', 'reason' in replay(game(40, { gap: 100 })))
ok('partie plus longue que le chrono refusee', 'reason' in replay(game(3, { gap: 60000 })))
ok('question inconnue refusee', 'reason' in replay([{ q: 'pirate', a: 'x', t: 1000 }]))
ok('trop de reponses refusee', 'reason' in replay(game(250)))
ok('horodatage negatif refuse', 'reason' in replay([{ q: ids[0], a: 'x', t: -5 }]))
ok('horodatages non croissants refuses',
  'reason' in replay([{ q: ids[0], a: optMap[ids[0]].good, t: 5000 },
                      { q: ids[1], a: optMap[ids[1]].good, t: 1000 }]))
ok('reponse geante refusee', 'reason' in replay([{ q: ids[0], a: 'x'.repeat(400), t: 1000 }]))

// 3. mauvaises reponses => score negatif, pas de cadeau
const bad = replay(game(10, { allGood: false }))
ok('mauvaises reponses -> score negatif', !('reason' in bad) && bad.score < 0)

// 4. le score forge par le client est ignore (il n'est meme pas lu)
ok('le score n est pas un champ d entree', !/body\.score/.test(ts))

// 5. plafond
const huge = replay(game(133))
ok('partie parfaite de 133 depasse le plafond',
  !('reason' in huge) && huge.score > MAX_SCORE)

let fail = 0
for (const [name, cond] of T) {
  console.log((cond ? '  OK   ' : '  ECHEC') + '  ' + name)
  if (!cond) fail++
}
console.log(`\n${T.length - fail}/${T.length} controles passes`)
process.exit(fail ? 1 : 0)
