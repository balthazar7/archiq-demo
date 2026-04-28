import { useState } from 'react'
import { BRAND, FONTS, ACCENT_COLOR } from '../branding'
import { SidebarCategories } from './SidebarCategories'
import { Leaderboard } from './Leaderboard'

export function GameLayout({ categories, leaderboardKey, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-stone-50 overflow-hidden">

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border-b border-stone-200 flex-shrink-0 shadow-sm">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex-shrink-0 p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          aria-label="Voir les catégories"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span
          className="font-black text-lg flex-shrink-0 tracking-tight"
          style={{ color: ACCENT_COLOR }}
        >
          {BRAND.name}
        </span>
        <div className="flex-1 overflow-x-auto flex items-center gap-2 ml-1 min-w-0">
          {categories.filter((c) => c.isActive).map((cat) => (
            <div
              key={cat.id}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-100 text-stone-700 text-xs font-medium"
            >
              <span>{cat.icon}</span>
              <span className="hidden sm:inline">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-white border-r border-stone-200 overflow-y-auto flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 flex-shrink-0">
              <span className="font-black text-stone-900">{BRAND.name}</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xl leading-none"
              >✕</button>
            </div>
            <SidebarCategories categories={categories} />
            <div className="border-t border-stone-200 p-4">
              <Leaderboard refreshKey={leaderboardKey} />
            </div>
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* ── Desktop 3-column layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 bg-white border-r border-stone-200 overflow-y-auto flex-shrink-0">
          <div className="px-4 py-5 border-b border-stone-100 flex-shrink-0">
            <img
              src={BRAND.logoPrincipal}
              alt="Archi Q logo"
              className="w-full max-w-[140px] mx-auto mb-3 object-contain"
            />
            <h1
              className="font-black text-2xl tracking-tight text-center leading-none"
              style={{ color: ACCENT_COLOR }}
            >
              {BRAND.name}
            </h1>
            <p
              className="text-stone-500 text-xs text-center mt-1 leading-tight"
              style={{ fontFamily: FONTS.subtitle }}
            >
              {BRAND.subtitle}
            </p>
          </div>
          <SidebarCategories categories={categories} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-72 bg-white border-l border-stone-200 overflow-y-auto flex-shrink-0 p-4">
          <Leaderboard refreshKey={leaderboardKey} />
        </aside>
      </div>
    </div>
  )
}
