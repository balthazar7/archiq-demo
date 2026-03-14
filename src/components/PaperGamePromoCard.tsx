import { BRAND, FONTS } from '../branding'

export function PaperGamePromoCard() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white shadow-md overflow-hidden">

      {/* Image promotionnelle */}
      <div className="w-full bg-stone-100 overflow-hidden">
        <img
          src={BRAND.imagePromo}
          alt="Archi Q — le jeu de société"
          className="w-full object-cover"
          style={{ maxHeight: '220px', objectPosition: 'center' }}
        />
      </div>

      <div className="p-6">
        {/* Badge */}
        <span className="inline-block mb-3 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold uppercase tracking-widest">
          🃏 Jeu de société
        </span>

        {/* Titre */}
        <h3
          className="text-stone-900 font-black text-xl mb-1 leading-tight"
          style={{ fontFamily: FONTS.subtitle }}
        >
          Découvrez le jeu de société{' '}
          <span className="text-amber-600">Archi Q</span>
        </h3>
        <p className="text-stone-500 text-sm mb-4">
          Cette démo ne contient qu'une petite partie du jeu.
        </p>

        {/* Liste */}
        <ul className="text-sm text-stone-700 space-y-2 mb-5 bg-stone-50 rounded-xl px-4 py-4 border border-stone-100">
          {[
            '200 questions par catégorie',
            '6 catégories',
            '1 200 questions au total',
            'Un véritable jeu de société pour jouer entre amis ou en famille',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-amber-600 font-bold mt-0.5 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="text-stone-500 text-sm text-center mb-4">
          Soutenez le projet et découvrez la version complète :
        </p>

        {/* Bouton Ulule */}
        <a
          href={BRAND.ululeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-black text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-amber-200"
        >
          Découvrir le jeu sur Ulule
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}
