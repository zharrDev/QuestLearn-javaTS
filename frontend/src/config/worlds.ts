import type { DifficultyLevel } from '../types/typing.types'

/**
 * World catalog — one world per typing language.
 *
 * Everything the arena renders (sky, terrain, platforms, crates and the hero)
 * is generated in code from these palettes. No external art files are needed,
 * so adding a new language is purely a data change: add a world below and seed
 * its word bank on the backend.
 */
export type WorldDecor = 'village' | 'tropical' | 'mesa' | 'lavender' | 'alpine' | 'coast'

export interface WorldPalette {
  skyTop: string
  skyBottom: string
  sun: string
  cloud: string
  far: string
  mid: string
  near: string
  groundTop: string
  ground: string
  groundDark: string
  rock: string
  rockDark: string
  rockLight: string
  accent: string
  accentSoft: string
  box: string
  boxLight: string
  boxDark: string
  letter: string
  night?: boolean
  decor: WorldDecor
}

export interface WorldWordBank {
  EASY: string[]
  MEDIUM: string[]
  HARD: string[]
}

export interface WorldDef {
  slug: string
  name: string
  /** Endonym shown on the world cards. */
  nativeName: string
  flag: string
  /** Short English description so players from any country can pick a world. */
  description: string
  color: string
  palette: WorldPalette
  words: WorldWordBank
}

const villagePalette: WorldPalette = {
  skyTop: '#6FA9D6',
  skyBottom: '#F6E6C4',
  sun: '#FFE58A',
  cloud: '#FFF7E8',
  far: '#9DBB8F',
  mid: '#6E9A63',
  near: '#4E7047',
  groundTop: '#6FA050',
  ground: '#7A5A3B',
  groundDark: '#5A3F2A',
  rock: '#8A7458',
  rockDark: '#64513A',
  rockLight: '#A89070',
  accent: '#F2C14E',
  accentSoft: '#FFE8A3',
  box: '#B07A4A',
  boxLight: '#D9A86C',
  boxDark: '#6E4326',
  letter: '#FFF4D8',
  decor: 'village',
}

const tropicalPalette: WorldPalette = {
  skyTop: '#F7A56B',
  skyBottom: '#FFE4BC',
  sun: '#FFD166',
  cloud: '#FFF1DC',
  far: '#7FAE86',
  mid: '#4E8A5A',
  near: '#2F6444',
  groundTop: '#55A05A',
  ground: '#6B4A2F',
  groundDark: '#4A3220',
  rock: '#7B6A52',
  rockDark: '#574A38',
  rockLight: '#9C8A6C',
  accent: '#F2C14E',
  accentSoft: '#FFE9A8',
  box: '#C9A24A',
  boxLight: '#E8C97A',
  boxDark: '#7E5E1F',
  letter: '#FFF8E1',
  decor: 'tropical',
}

const mesaPalette: WorldPalette = {
  skyTop: '#F2A65A',
  skyBottom: '#F9DCB5',
  sun: '#FFD68A',
  cloud: '#FFF2DC',
  far: '#C98A5C',
  mid: '#B4703F',
  near: '#8C522C',
  groundTop: '#C99A55',
  ground: '#A66B3A',
  groundDark: '#7C4A26',
  rock: '#C48A55',
  rockDark: '#925E35',
  rockLight: '#E0AC75',
  accent: '#E85D3A',
  accentSoft: '#FFC9A8',
  box: '#C97B4A',
  boxLight: '#E8A66B',
  boxDark: '#7E4520',
  letter: '#FFF3D6',
  decor: 'mesa',
}

const lavenderPalette: WorldPalette = {
  skyTop: '#6F6399',
  skyBottom: '#E8C7D8',
  sun: '#F6E3A1',
  cloud: '#F3E6F2',
  far: '#8C7BA8',
  mid: '#6C5C8A',
  near: '#4A3F63',
  groundTop: '#7C6C9E',
  ground: '#54496B',
  groundDark: '#3B324D',
  rock: '#6B5F85',
  rockDark: '#473E5C',
  rockLight: '#8A7CA6',
  accent: '#F2C14E',
  accentSoft: '#FFE7B0',
  box: '#8C5A3C',
  boxLight: '#B9805A',
  boxDark: '#5A3724',
  letter: '#FFF4E6',
  night: true,
  decor: 'lavender',
}

const alpinePalette: WorldPalette = {
  skyTop: '#8FB8D9',
  skyBottom: '#EAF3FA',
  sun: '#FFF2B0',
  cloud: '#FFFFFF',
  far: '#A8BFD0',
  mid: '#5C7F6B',
  near: '#365B4A',
  groundTop: '#5E8C5A',
  ground: '#6E5A42',
  groundDark: '#4D3E2C',
  rock: '#8C8A80',
  rockDark: '#635F55',
  rockLight: '#B3B0A5',
  accent: '#E8A93B',
  accentSoft: '#FFE2A0',
  box: '#8A6A4A',
  boxLight: '#B08E66',
  boxDark: '#5A4029',
  letter: '#FFF8EA',
  decor: 'alpine',
}

const coastPalette: WorldPalette = {
  skyTop: '#6FB9D1',
  skyBottom: '#FFE0B2',
  sun: '#FFD37A',
  cloud: '#FFF8EC',
  far: '#7FB0B8',
  mid: '#4E8A8A',
  near: '#2F5F66',
  groundTop: '#D9C08A',
  ground: '#B08A5A',
  groundDark: '#7E5E3B',
  rock: '#7BA6B0',
  rockDark: '#4E7A85',
  rockLight: '#A9CCD3',
  accent: '#2E9AA8',
  accentSoft: '#A8E2E8',
  box: '#B98A5A',
  boxLight: '#DDB37E',
  boxDark: '#7E542F',
  letter: '#FFF6E8',
  decor: 'coast',
}

export const WORLD_DEFS: WorldDef[] = [
  {
    slug: 'bahasa-inggris',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    description: 'Type English words, useful phrases, and everyday sentences.',
    color: '#4C7A5E',
    palette: villagePalette,
    words: {
      EASY: ['book', 'home', 'light', 'apple', 'water', 'house', 'table', 'chair', 'door', 'bird', 'fish', 'tree', 'star', 'moon', 'rain'],
      MEDIUM: ['sunrise', 'village life', 'green forest', 'blue ocean', 'bright star', 'good morning', 'thank you', 'turn left', 'go straight'],
      HARD: ['The quiet village woke up.', 'A gentle breeze blew through the trees.', 'Never give up on your dreams.'],
    },
  },
  {
    slug: 'bahasa-indonesia',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    description: 'Ketik kata, frasa, dan kalimat bahasa Indonesia sehari-hari.',
    color: '#D97757',
    palette: tropicalPalette,
    words: {
      EASY: ['buku', 'rumah', 'lampu', 'apel', 'air', 'meja', 'kursi', 'pintu', 'burung', 'ikan', 'pohon', 'bulan', 'hujan', 'lagu', 'pagi'],
      MEDIUM: ['matahari terbit', 'sawah hijau', 'laut biru', 'selamat pagi', 'terima kasih', 'sampai jumpa', 'hati-hati', 'mimpi indah'],
      HARD: ['Desa yang tenang mulai terbangun.', 'Angin pagi berhembus lembut di antara pohon.', 'Jangan pernah menyerah pada mimpimu.'],
    },
  },
  {
    slug: 'bahasa-spanyol',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    description: 'Escribe palabras, frases y oraciones en español.',
    color: '#D98E3B',
    palette: mesaPalette,
    words: {
      EASY: ['libro', 'casa', 'luz', 'agua', 'mesa', 'silla', 'puerta', 'pájaro', 'pez', 'árbol', 'luna', 'lluvia', 'fuego', 'sol', 'mar'],
      MEDIUM: ['amanecer', 'bosque verde', 'océano azul', 'buenos días', 'buenas noches', 'hasta luego', 'ten cuidado', 'dulces sueños'],
      HARD: ['El pueblo tranquilo despertó.', 'Una brisa suave soplaba entre los árboles.', 'La paciencia es una virtud.'],
    },
  },
  {
    slug: 'bahasa-prancis',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    description: 'Tapez des mots, des phrases et des textes en français.',
    color: '#8A7BC8',
    palette: lavenderPalette,
    words: {
      EASY: ['livre', 'maison', 'lumière', 'pomme', 'eau', 'table', 'chaise', 'porte', 'oiseau', 'poisson', 'arbre', 'lune', 'pluie', 'feu', 'mer'],
      MEDIUM: ['lever du soleil', 'forêt verte', 'océan bleu', 'bonjour', 'bonne nuit', 'merci', 'à bientôt', 'doux rêves'],
      HARD: ["Le village tranquille s'est réveillé.", 'Une brise légère soufflait dans les arbres.', 'La patience est une vertu.'],
    },
  },
  {
    slug: 'bahasa-jerman',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    description: 'Tippe deutsche Wörter, Sätze und Alltagstexte.',
    color: '#4A7BA8',
    palette: alpinePalette,
    words: {
      EASY: ['Buch', 'Haus', 'Licht', 'Apfel', 'Wasser', 'Tisch', 'Stuhl', 'Tür', 'Vogel', 'Fisch', 'Baum', 'Mond', 'Regen', 'Schnee', 'Feuer'],
      MEDIUM: ['Sonnenaufgang', 'grüner Wald', 'blaues Meer', 'guten Morgen', 'gute Nacht', 'danke schön', 'bis bald', 'schöne Träume'],
      HARD: ['Das stille Dorf erwachte.', 'Ein sanfter Wind wehte durch die Bäume.', 'Geduld ist eine Tugend.'],
    },
  },
  {
    slug: 'bahasa-portugis',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    description: 'Digite palavras, frases e textos em português.',
    color: '#2E9AA8',
    palette: coastPalette,
    words: {
      EASY: ['livro', 'casa', 'luz', 'maçã', 'água', 'mesa', 'cadeira', 'porta', 'pássaro', 'peixe', 'árvore', 'lua', 'chuva', 'fogo', 'mar'],
      MEDIUM: ['nascer do sol', 'floresta verde', 'oceano azul', 'bom dia', 'boa noite', 'obrigado', 'até logo', 'bons sonhos'],
      HARD: ['A aldeia tranquila acordou.', 'Uma brisa suave soprava entre as árvores.', 'A paciência é uma virtude.'],
    },
  },
]

export const WORLD_BY_SLUG: Record<string, WorldDef> = Object.fromEntries(
  WORLD_DEFS.map((w) => [w.slug, w]),
)

/** Resolve a world from an API payload, tolerating older sessions. */
export function resolveWorld(input?: { slug?: string; name?: string; id?: number }): WorldDef {
  if (input?.slug && WORLD_BY_SLUG[input.slug]) return WORLD_BY_SLUG[input.slug]
  const name = (input?.name || '').toLowerCase()
  if (name.includes('indonesia')) return WORLD_BY_SLUG['bahasa-indonesia']
  if (name.includes('spanyol') || name.includes('spanish') || name.includes('español')) return WORLD_BY_SLUG['bahasa-spanyol']
  if (name.includes('prancis') || name.includes('french') || name.includes('français')) return WORLD_BY_SLUG['bahasa-prancis']
  if (name.includes('jerman') || name.includes('german') || name.includes('deutsch')) return WORLD_BY_SLUG['bahasa-jerman']
  if (name.includes('portug')) return WORLD_BY_SLUG['bahasa-portugis']
  if (name.includes('inggris') || name.includes('english')) return WORLD_BY_SLUG['bahasa-inggris']
  const index = ((input?.id ?? 1) - 1 + WORLD_DEFS.length) % WORLD_DEFS.length
  return WORLD_DEFS[index]
}

export function fallbackWords(world: WorldDef, difficulty: DifficultyLevel): string[] {
  return world.words[difficulty] || world.words.EASY
}

/** Strip diacritics so a player without a localized keyboard can still type. */
export function normalizeChar(ch: string): string {
  return ch
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .toLowerCase()
}

export function sameChar(a: string, b: string): boolean {
  return normalizeChar(a) === normalizeChar(b)
}
