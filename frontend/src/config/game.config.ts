export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface DifficultyConfig {
  maxEn: number;
  waveSz: number;
  dashSpd: number;
  spawnGap: number;
  enemySpd: number;
  worldSpd: number;
  onScreen: number;
  hearts: number;
}

export const GAME_CONSTANTS = {
  LETTER_SPACING: 110,
  MIN_ENEMY_GAP: 160,
};

export const CFG: Record<DifficultyLevel, DifficultyConfig> = {
  EASY: { maxEn: 4, waveSz: 10, dashSpd: 220, spawnGap: 350, enemySpd: 85, worldSpd: 45, onScreen: 3, hearts: 6 },
  MEDIUM: { maxEn: 6, waveSz: 16, dashSpd: 260, spawnGap: 280, enemySpd: 115, worldSpd: 60, onScreen: 3, hearts: 5 },
  HARD: { maxEn: 10, waveSz: 24, dashSpd: 300, spawnGap: 220, enemySpd: 135, worldSpd: 70, onScreen: 4, hearts: 4 },
};

export const THEMES: Record<number, { bgFile: string; boxFile: string }> = {
  1: { bgFile: '/assets/village-960x360.png', boxFile: '/assets/crate-blank-32-removebg-preview.png' },
  2: { bgFile: '/assets/desert-ruins-960x360.png', boxFile: '/assets/sandstone-block-32-removebg-preview.png' },
  3: { bgFile: '/assets/forest-runes-960x360.png', boxFile: '/assets/mossy-crate-32-removebg-preview.png' },
};

export const GROUND_RATIO: Record<number, number> = {
  1: 0.82,
  2: 0.8,
  3: 0.84,
};

export const ANIM = {
  idle: { pre: 'idle_', cnt: 4 },
  run: { pre: 'run_', cnt: 7 },
  jump: { pre: 'jump_', cnt: 2 },
  slash: { pre: 'sword_slash_attack_', cnt: 7 },
};
