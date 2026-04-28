import logoHP  from './assets/logo categories/Logo histoire et patrimoine.png'
import logoIng from './assets/logo categories/Logo ingénieurie.png'
import logoAI  from './assets/logo categories/Logo Architecture inconique.png'
import logoUrb from './assets/logo categories/Logo urbanisme et paysage.png'
import logoArt from './assets/logo categories/Logo art et design.png'
import logoVis from './assets/logo categories/Logo visuel.png'
import logoPrincipal from './assets/logo principal/Logo principal V2.png'
import imagePromo    from './assets/image de promotion/New pack shot.png'

export const BRAND = {
  name: 'Archi Q',
  subtitle: 'Le jeu de culture Architecturale',
  demoQuestionCount: 100,
  totalQuestionCount: 1200,
  ululeUrl: 'https://fr.ulule.com/archiq/',
  logoPrincipal,
  imagePromo,
}

export const FONTS = {
  subtitle: '"Agency FB", "Arial Narrow", Helvetica, sans-serif',
}

export const ACCENT_COLOR = 'rgb(50, 84, 151)'

export const CATEGORY_META = {
  'cat-1': { color: 'rgb(249, 174, 18)', colorHex: '#f9ae12', logo: logoHP,  textOnColor: '#fff' },
  'cat-2': { color: 'rgb(157, 98, 165)', colorHex: '#9d62a5', logo: logoIng, textOnColor: '#fff' },
  'cat-3': { color: 'rgb(238, 52, 61)',  colorHex: '#ee343d', logo: logoAI,  textOnColor: '#fff' },
  'cat-4': { color: 'rgb(14, 127, 64)',  colorHex: '#0e7f40', logo: logoUrb, textOnColor: '#fff' },
  'cat-5': { color: 'rgb(152, 90, 21)',  colorHex: '#985a15', logo: logoArt, textOnColor: '#fff' },
  'cat-6': { color: 'rgb(50, 84, 151)',  colorHex: '#325497', logo: logoVis, textOnColor: '#fff' },
}
