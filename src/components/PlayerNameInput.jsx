import { useState, useRef, useEffect } from 'react'
import { BRAND, FONTS, ACCENT_COLOR } from '../branding'

export function PlayerNameInput({ onSubmit, onBack }) {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [agence, setAgence] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = () => {
    const trimmedPrenom = prenom.trim()
    if (trimmedPrenom) onSubmit(trimmedPrenom, nom.trim(), agence.trim())
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const fieldClass = 'w-full bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-base placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 transition-all'

  return (
    <div className="flex items-center justify-center h-full min-h-[500px] p-4 bg-stone-50">
      <div className="bg-white border border-stone-200 rounded-3xl p-8 w-full max-w-md shadow-md">

        <div className="flex items-center gap-3 mb-6">
          <img src={BRAND.logoPrincipal} alt="Archi Q" className="w-12 h-12 object-contain rounded-lg" />
          <div>
            <p className="font-black text-lg leading-none" style={{ color: ACCENT_COLOR }}>{BRAND.name}</p>
            <p className="text-stone-400 text-xs mt-0.5" style={{ fontFamily: FONTS.subtitle }}>{BRAND.subtitle}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-stone-900 mb-1">Vos informations</h2>
        <p className="text-stone-500 text-sm mb-6">Elles apparaîtront dans le classement.</p>

        <div className="flex flex-col gap-4">

          {/* Prénom — obligatoire */}
          <div>
            <label className="block text-stone-700 text-sm font-semibold mb-1">
              Prénom <span style={{ color: ACCENT_COLOR }}>*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ex : Marie"
              maxLength={30}
              className={fieldClass}
              style={{ '--tw-ring-color': ACCENT_COLOR }}
            />
          </div>

          {/* Nom — facultatif */}
          <div>
            <label className="block text-stone-700 text-sm font-semibold mb-1">
              Nom <span className="text-stone-400 font-normal">(facultatif)</span>
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ex : Dupont"
              maxLength={30}
              className={fieldClass}
              style={{ '--tw-ring-color': ACCENT_COLOR }}
            />
          </div>

          {/* Agence / organisme — facultatif */}
          <div>
            <label className="block text-stone-700 text-sm font-semibold mb-1">
              Agence / organisme <span className="text-stone-400 font-normal">(facultatif)</span>
            </label>
            <input
              type="text"
              value={agence}
              onChange={(e) => setAgence(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ex : Atelier Dupont"
              maxLength={50}
              className={fieldClass}
              style={{ '--tw-ring-color': ACCENT_COLOR }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-all font-medium"
          >
            Retour
          </button>
          <button
            onClick={handleSubmit}
            disabled={!prenom.trim()}
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
