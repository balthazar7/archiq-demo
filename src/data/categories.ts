import type { Category } from '../types'

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Histoire et Patrimoine',
    icon: '🏛️',
    description: 'Révolutions, monuments et grandes figures',
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'Ingénierie',
    icon: '⚙️',
    description: 'Ponts, tunnels et prouesses techniques',
    isActive: false,
  },
  {
    id: 'cat-3',
    name: 'Architecture Iconique',
    icon: '🏰',
    description: 'Les œuvres bâties qui ont marqué le monde',
    isActive: true,
  },
  {
    id: 'cat-4',
    name: 'Urbanisme et Paysage',
    icon: '🌆',
    description: 'Villes, places et aménagements urbains',
    isActive: false,
  },
  {
    id: 'cat-5',
    name: 'Art et Design',
    icon: '🎨',
    description: 'Mouvements artistiques et créateurs',
    isActive: false,
  },
  {
    id: 'cat-6',
    name: 'Visuels',
    icon: '👁️',
    description: 'Reconnaissez les images emblématiques',
    isActive: false,
  },
]
