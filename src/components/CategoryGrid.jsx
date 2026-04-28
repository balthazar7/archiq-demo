export function CategoryGrid({ categories, onSelect }) {
  return (
    <div>
      <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-4">
        Choisissez une catégorie
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function CategoryCard({ category, onSelect }) {
  const active = category.isActive

  return (
    <button
      onClick={() => active && onSelect(category)}
      disabled={!active}
      aria-label={active ? `Jouer à ${category.name}` : `${category.name} — bientôt disponible`}
      className={[
        'relative flex flex-col items-center justify-center gap-2 rounded-2xl p-4 sm:p-5',
        'text-center transition-all duration-200 border',
        'min-h-[130px] sm:min-h-[150px]',
        active
          ? 'bg-slate-800 border-amber-500/40 hover:border-amber-400 hover:bg-slate-700 hover:scale-[1.03] cursor-pointer shadow-lg hover:shadow-amber-500/10'
          : 'bg-slate-800/40 border-slate-700/40 cursor-not-allowed opacity-60',
      ].join(' ')}
    >
      <span className="text-3xl sm:text-4xl">{category.icon}</span>

      <span className={`font-semibold text-sm sm:text-base leading-tight ${active ? 'text-white' : 'text-slate-500'}`}>
        {category.name}
      </span>

      {active ? (
        <span className="mt-1 px-3 py-0.5 rounded-full bg-amber-500 text-slate-900 text-xs font-bold uppercase tracking-wide">
          Jouer
        </span>
      ) : (
        <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-700 text-slate-500 text-xs font-medium flex items-center gap-1">
          🔒 Bientôt
        </span>
      )}
    </button>
  )
}
