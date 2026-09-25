// Test bout en bout contre l'infrastructure RÉELLE (production).
//
//   npm run check:production
//
// ⚠️ Crée deux vraies lignes dans `scores` (TEST-SECURITE ~6,50 et
//    TEST-TRICHE ~3,45) en vérifiant que le chemin honnête marche.
//    Les retirer ensuite avec supabase/nettoyer_lignes_test.sql.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.argv[2]
const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8')
const URL = env.match(/VITE_SUPABASE_URL=(.+)/)[1].trim()
const KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)[1].trim()

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const SALT = 'aq7:'
function fnv1a(s) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0 }
  return h >>> 0
}

// mapping question -> bonne réponse (via les options du bundle)
const qjs = fs.readFileSync(path.join(ROOT, 'src/data/questions.js'), 'utf8')
const re = /id:\s*["']([^"']+)["'][\s\S]*?options:\s*(\[[\s\S]*?\]),\s*\n?\s*answerHash:\s*(\d+)/g
const Q = []
let m
while ((m = re.exec(qjs))) {
  const opts = eval(m[2])
  Q.push({ id: m[1], good: opts.find((o) => fnv1a(SALT + m[1] + '|' + o) === Number(m[3])) })
}

const startGame = async () => {
  const r = await fetch(`${URL}/functions/v1/start-game`, { method: 'POST', headers: H, body: '{}' })
  return (await r.json()).sessionId
}
const submit = async (body) => {
  const r = await fetch(`${URL}/functions/v1/submit-score`, {
    method: 'POST', headers: H, body: JSON.stringify(body),
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}
const game = (n, gap = 1000) =>
  Array.from({ length: n }, (_, i) => ({ q: Q[i].id, a: Q[i].good, t: (i + 1) * gap }))

const results = []
const check = (name, cond, detail) => { results.push([name, cond, detail]) }

// 1 — partie honnête
const s1 = await startGame()
const r1 = await submit({ sessionId: s1, pseudo: 'TEST-SECURITE', answers: game(5) })
check('partie honnete acceptee', r1.status === 200 && r1.body?.ok,
  `HTTP ${r1.status} score=${r1.body?.score}`)

// 2 — rejeu de la même session
const r2 = await submit({ sessionId: s1, pseudo: 'TEST-SECURITE', answers: game(5) })
check('rejeu de la session refuse', r2.status === 409, `HTTP ${r2.status} ${r2.body?.error}`)

// 3 — score annoncé par le client : ignoré
const s3 = await startGame()
const r3 = await submit({ sessionId: s3, pseudo: 'TEST-TRICHE', score: 9999, answers: game(3) })
check('score annonce par le client ignore',
  r3.status === 200 && r3.body?.score < 10, `score retenu = ${r3.body?.score}`)

// 4 — cadence de bot
const s4 = await startGame()
const r4 = await submit({ sessionId: s4, pseudo: 'TEST-BOT', answers: game(40, 50) })
check('cadence de bot refusee', r4.status === 422, `HTTP ${r4.status} ${r4.body?.detail}`)

// 5 — session inventée
const r5 = await submit({
  sessionId: '00000000-0000-0000-0000-000000000000', pseudo: 'TEST', answers: game(3),
})
check('session inventee refusee', r5.status === 403, `HTTP ${r5.status} ${r5.body?.error}`)

// 6 — sans session
const r6 = await submit({ pseudo: 'TEST', answers: game(3) })
check('envoi sans session refuse', r6.status === 400, `HTTP ${r6.status} ${r6.body?.error}`)

// 7 — INJECTION DIRECTE PAR CURL (le coeur du sujet)
const inj = await fetch(`${URL}/rest/v1/scores`, {
  method: 'POST', headers: { ...H, Prefer: 'return=representation' },
  body: JSON.stringify({ pseudo: 'TEST-INJECTION', score: 499, nb_parties: 1 }),
})
const injBody = await inj.text()
check('INJECTION DIRECTE bloquee', inj.status === 401 || inj.status === 403,
  `HTTP ${inj.status} ${injBody.slice(0, 90)}`)

let fail = 0
for (const [name, ok, detail] of results) {
  console.log(`${ok ? '  OK   ' : '  ECHEC'}  ${name.padEnd(36)} ${detail}`)
  if (!ok) fail++
}
console.log(`\n${results.length - fail}/${results.length} controles passes`)
process.exit(fail ? 1 : 0)
