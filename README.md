# Grand Quiz — MVP

Démo front-end jouable d'un jeu de quiz à saisie libre.
**Stack :** React 18 · TypeScript · Vite · Tailwind CSS

---

## Lancer le projet

```bash
cd quiz-demo
npm install
npm run dev
```

Ouvrez `http://localhost:5173` dans votre navigateur.

---

## Structure du projet

```
quiz-demo/
├── src/
│   ├── config.ts            ← Constantes globales (durée, etc.)
│   ├── types/index.ts       ← Interfaces TypeScript
│   ├── data/
│   │   ├── categories.ts    ← 6 catégories (2 actives)
│   │   └── questions.ts     ← Questions mockées + getQuestionsForCategory()
│   ├── utils/
│   │   ├── validation.ts    ← Comparaison réponse (accents, casse, espaces)
│   │   └── leaderboard.ts   ← Lecture/écriture localStorage
│   ├── hooks/
│   │   └── useGameLogic.ts  ← Timer, score, feedback, avance automatique
│   ├── components/
│   │   ├── CategoryGrid.tsx
│   │   ├── PlayerNameInput.tsx
│   │   ├── GameScreen.tsx
│   │   ├── ResultScreen.tsx
│   │   └── Leaderboard.tsx
│   ├── App.tsx              ← Machine à états : home → naming → playing → results
│   ├── main.tsx
│   └── index.css
└── ...config files
```

---

## Modifier la durée de partie

Dans [`src/config.ts`](src/config.ts) :

```ts
GAME_DURATION_SECONDS: 60  // → 30 ou 120
```

---

## Ajouter des questions

**Option 1 — Directement dans le code :**
Ajoutez des objets dans le tableau `questions` dans [`src/data/questions.ts`](src/data/questions.ts).

```ts
{
  id: 'h13',
  categoryId: 'cat-1',
  question: 'Votre question ?',
  answer: 'Réponse principale',
  alternateAnswers: ['variante 1', 'variante 2'],
}
```

**Option 2 — Import CSV (à implémenter) :**
Remplacez le tableau `questions` par un parser CSV.
Format attendu : `id, categoryId, question, answer, alternateAnswers (séparées par |)`.

---

## Activer une nouvelle catégorie

Dans [`src/data/categories.ts`](src/data/categories.ts), passez `isActive: true` sur la catégorie souhaitée.

---

## Classement

Stocké dans `localStorage` sous la clé `grand-quiz-leaderboard`.
Pour réinitialiser : `localStorage.removeItem('grand-quiz-leaderboard')` dans la console du navigateur.
