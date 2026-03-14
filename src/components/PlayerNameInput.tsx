import { useState, useRef, useEffect } from 'react'
import { BRAND, FONTS, ACCENT_COLOR } from '../branding'

interface Props {
  onSubmit: (name: string) => void
  onBack: () => void
}

export function PlayerNameInput({ onSubmit, onBack }: Props) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (trimmed) onSubmit(trimmed)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="flex items-center justify-center h-full min-h-[500px] p-4 bg-stone-50">
      <div className="bg-white border border-stone-200 rounded-3xl p-8 w-full max-w-md shadow-md">

        <div className="flex items-center gap-3 mb-6">
          <img
            src={BRAND.logoPrincipal}
            alt="Archi Q"
            className="w-12 h-12 object-contain rounded-lg"
          />
          <div>
            <p
              className="font-black text-lg leading-none"
              style={{ color: ACCENT_COLOR }}
            >
              {BRAND.name}
            </p>
            <p
              className="text-stone-400 text-xs mt-0.5"
              style={{ fontFamily: FONTS.subtitle }}
            >
              {BRAND.subtitle}
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-stone-900 mb-2">Votre prénom</h2>
        <p className="text-stone-500 text-sm mb-6">Il apparaîtra dans le classement.</p>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ex : Marie"
          maxLength={20}
          className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-lg placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all"
          style={{ '--tw-ring-color': ACCENT_COLOR } as React.CSSProperties}
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-all font-medium"
          >
            Retour
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-[2] py-3 rounded-xl text-white font-black text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            style={{ backgroundColor: ACCENT_COLOR }}
          >
            C'est parti !
          </button>
        </div>
      </div>
    </div>
  )
}
