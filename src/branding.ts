// ── Imports des assets ────────────────────────────────────────────────────────
import logoHP  from './assets/logo categories/Logo histoire et patrimoine.png'
import logoIng from './assets/logo categories/Logo ingénieurie.png'
import logoAI  from './assets/logo categories/Logo Architecture inconique.png'
import logoUrb from './assets/logo categories/Logo urbanisme et paysage.png'
import logoArt from './assets/logo categories/Logo art et design.png'
import logoVis from './assets/logo categories/Logo visuel.png'
import logoPrincipal from './assets/logo principal/logo principale.jpg'
import imagePromo    from './assets/image de promotion/1.png'

// ── Identité du jeu ──────────────────────────────────────────────────────────
export const BRAND = {
  name: 'Archi Q',
  subtitle: 'Le jeu de culture Architecturale',
  demoQuestionCount: 100,
  totalQuestionCount: 1200,
  ululeUrl: 'https://fr.ulule.com/archiq/',
  logoPrincipal,
  imagePromo,
} as const

// ── Polices ───────────────────────────────────────────────────────────────────
// Agency FB est une police Windows. Pour l'activer en web font, déposer
// agency-fb.woff2 dans public/fonts/ et décommenter @font-face dans index.css.
export const FONTS = {
  subtitle: '"Agency FB", "Arial Narrow", Helvetica, sans-serif',
} as const

// ── Couleur d'accent principale (bleu Archi Q) ────────────────────────────────
export const ACCENT_COLOR = 'rgb(50, 84, 151)' // #325497 — titre, scores, accents

// ── Métadonnées visuelles des catégories ─────────────────────────────────────
export interface CategoryMeta {
  color: string    // rgb() officiel
  colorHex: string
  logo: string     // URL de l'image importée par Vite
  textOnColor: string
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  'cat-1': { color: 'rgb(249, 174, 18)', colorHex: '#f9ae12', logo: logoHP,  textOnColor: '#fff' },
  'cat-2': { color: 'rgb(157, 98, 165)', colorHex: '#9d62a5', logo: logoIng, textOnColor: '#fff' },
  'cat-3': { color: 'rgb(238, 52, 61)',  colorHex: '#ee343d', logo: logoAI,  textOnColor: '#fff' },
  'cat-4': { color: 'rgb(14, 127, 64)',  colorHex: '#0e7f40', logo: logoUrb, textOnColor: '#fff' },
  'cat-5': { color: 'rgb(152, 90, 21)',  colorHex: '#985a15', logo: logoArt, textOnColor: '#fff' },
  'cat-6': { color: 'rgb(50, 84, 151)',  colorHex: '#325497', logo: logoVis, textOnColor: '#fff' },
}
