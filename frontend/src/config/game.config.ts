import type { DifficultyLevel } from '../types/typing.types'

/**
 * Difficulty tuning. Speeds are expressed as a fraction of the viewport width
 * per second so the pacing feels identical on a phone and on a desktop.
 */
export interface DifficultyConfig {
  /** Maximum number of crate groups alive at once. */
  onScreen: number
  hearts: number
  /** Camera speed in viewport-widths per second. */
  worldSpeed: number
  /** Minimum gap between two platforms, in viewport widths. */
  gapRatio: number
  /** 0 = ground only, 1 = low cliffs, 2 = high cliffs. */
  tierMax: number
  /** Word groups that spawn in the opening screen. */
  openingGroups: number
}

export const CFG: Record<DifficultyLevel, DifficultyConfig> = {
  EASY: { onScreen: 3, hearts: 5, worldSpeed: 0.045, gapRatio: 0.12, tierMax: 1, openingGroups: 3 },
  MEDIUM: { onScreen: 3, hearts: 4, worldSpeed: 0.058, gapRatio: 0.11, tierMax: 2, openingGroups: 3 },
  HARD: { onScreen: 4, hearts: 3, worldSpeed: 0.072, gapRatio: 0.1, tierMax: 2, openingGroups: 4 },
}

export const DURATION_OPTIONS: { value: 30 | 60 | 300; labelEn: string; labelId: string }[] = [
  { value: 30, labelEn: '30 sec', labelId: '30 detik' },
  { value: 60, labelEn: '1 min', labelId: '1 menit' },
  { value: 300, labelEn: '5 min', labelId: '5 menit' },
]

/** Deterministic pseudo-random helper used by the terrain renderer. */
export function hash01(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
