import type { Category } from '../types'
import { CATEGORY_META } from '../branding'
import { questions } from '../data/questions'

interface Props {
  categories: Category[]
}

/** Icône cadenas SVG — intérieur blanc, propre sur tous les fonds */
function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 text-stone-400 flex-shrink-0"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" ry="2" fill="white" stroke="currentColor" strokeWidth={1.5} />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export function SidebarCategories({ categories }: Props) {
  return (
    <nav className="flex flex-col gap-1.5 p-3">
      <h2 className="text-stone-400 text-xs font-semibold uppercase tracking-widest px-2 mb-2">
        Catégories
      </h2>

      {categories.map((cat) => {
        const meta = CATEGORY_META[cat.id]
        const count = questions.filter((q) => q.categoryId === cat.id).length

        return (
          <div
            key={cat.id}
            className={[
              'flex flex-col gap-1 rounded-xl px-3 py-2.5 border transition-all',
              cat.isActive
                ? 'bg-white border-stone-200 shadow-sm'
                : 'bg-stone-50 border-stone-100',
            ].join(' ')}
            style={cat.isActive && meta ? {
              borderLeftWidth: '3px',
              borderLeftColor: meta.colorHex,
            } : undefined}
          >
            <div className="flex items-center gap-2">
              {/* Logo catégorie */}
              {meta ? (
                <img
                  src={meta.logo}
                  alt={cat.name}
                  className={[
                    'w-8 h-8 object-contain flex-shrink-0',
                    cat.isActive ? '' : 'opacity-40 saturate-50',
                  ].join(' ')}
                />
              ) : (
                <span className="text-xl leading-none flex-shrink-0">{cat.icon}</span>
              )}

              <span
                className={`text-sm font-semibold leading-tight flex-1 ${
                  cat.isActive ? 'text-stone-800' : 'text-stone-400'
                }`}
              >
                {cat.name}
              </span>

              {cat.isActive ? (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: meta?.colorHex ?? '#325497' }}
                />
              ) : (
                <LockIcon />
              )}
            </div>

            <p className={`text-xs pl-10 leading-tight ${cat.isActive ? 'text-stone-500' : 'text-stone-400'}`}>
              {cat.isActive
                ? `${count} questions disponibles / 200 en version papier`
                : '200 questions disponible en version papier'}
            </p>
          </div>
        )
      })}
    </nav>
  )
}
