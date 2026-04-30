import { useEffect, useState } from 'react'
import { ACCENT_COLOR } from '../branding'

export function CountdownScreen({ onEnd }) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count === 0) {
      onEnd()
      return
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [count, onEnd])

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] px-6 py-10 bg-stone-50">

      {/* Message */}
      <div className="bg-white border border-stone-200 rounded-2xl px-6 py-5 w-full max-w-md shadow-sm mb-10 text-center">
        <p className="text-stone-600 text-sm leading-relaxed">
          Ce jeu numérique est la démo d'un jeu en version physique.<br />
          Il ne contient que{' '}
          <span className="font-bold text-stone-900">115 questions</span>{' '}
          sur les 1&nbsp;200.<br />
          Il ne donne accès qu'à{' '}
          <span className="font-bold text-stone-900">3 catégories</span>{' '}
          sur 6.
        </p>
      </div>

      {/* Compte à rebours */}
      <p
        key={count}
        className="font-black leading-none tabular-nums select-none"
        style={{ color: ACCENT_COLOR, fontSize: '9rem' }}
      >
        {count}
      </p>
    </div>
  )
}
