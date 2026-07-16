export interface ThemeColors {
  skyTop: string
  skyBot: string
  skyMid: string
  groundTop: string
  groundMid: string
  groundBot: string
  platform: string
  platformEdge: string
  platformTop: string
  hillFar: string
  hillMid: string
  hillNear: string
  accent: string
  doorFrame: string
  shopWood: string
  shopRoof: string
  coin: string
  coinInner: string
  heart: string
}

export const THEMES: Record<string, ThemeColors> = {
  english: {
    skyTop: '#87CEEB', skyBot: '#E8F4FD', skyMid: '#C5E3F0',
    groundTop: '#7A9B6B', groundMid: '#6B8C5B', groundBot: '#5A7B4A',
    platform: '#A67C52', platformEdge: '#8B6A4A', platformTop: '#BFA07A',
    hillFar: '#8BB07A', hillMid: '#7A9B6B', hillNear: '#6B8C5B',
    accent: '#D97757', doorFrame: '#8B5E3C', shopWood: '#D2A679', shopRoof: '#A64A3A',
    coin: '#FFD93D', coinInner: '#E8A93B', heart: '#FF4444',
  },
  math: {
    skyTop: '#F0D9A0', skyBot: '#F5ECD5', skyMid: '#E8D5B0',
    groundTop: '#C9A46A', groundMid: '#B89355', groundBot: '#A78240',
    platform: '#D6BFA0', platformEdge: '#C2A880', platformTop: '#E2D0B8',
    hillFar: '#D4C090', hillMid: '#C9A46A', hillNear: '#B89355',
    accent: '#2C5F5D', doorFrame: '#7A6A50', shopWood: '#C2A880', shopRoof: '#8B6A4A',
    coin: '#FFD93D', coinInner: '#E8A93B', heart: '#FF4444',
  },
  logic: {
    skyTop: '#3A4A6B', skyBot: '#6B7FA0', skyMid: '#4A5A7B',
    groundTop: '#5A7B5A', groundMid: '#4A6B4A', groundBot: '#3A5B3A',
    platform: '#6B8A6B', platformEdge: '#5A7A5A', platformTop: '#7A9A7A',
    hillFar: '#4A6A4A', hillMid: '#3A5A3A', hillNear: '#2A4A2A',
    accent: '#E8A93B', doorFrame: '#5A4A3A', shopWood: '#8B7A6A', shopRoof: '#6A5A4A',
    coin: '#FFD93D', coinInner: '#E8A93B', heart: '#FF4444',
  },
}

export const THEME_KEY_MAP: Record<string, string> = {
  english: 'english',
  math: 'math',
  logic: 'logic',
}
