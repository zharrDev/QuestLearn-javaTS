export interface TypingWord {
  id: number;
  teks: string;
  levelKesulitan: 'EASY' | 'MEDIUM' | 'HARD';
  duniaId: number;
}

export interface TypingStartResponse {
  sessionId: number;
  words: string[];
  totalWords: number;
  level: string;
  duniaNama: string;
  duniaId: number;
}

export interface TypingSessionResponse {
  id: number;
  duniaId: number;
  duniaNama: string;
  level: string;
  skor: number;
  wpm: number;
  akurasi: number;
  comboTerpanjang: number;
  totalMusuhKalah: number;
  totalMusuhLolos: number;
  xpDidapat: number;
  waktuMulai: string;
  waktuSelesai: string;
}

export interface SubmitTypingRequest {
  duniaId: number;
  level: string;
  skor: number;
  wpm: number;
  akurasi: number;
  comboTerpanjang: number;
  totalMusuhKalah: number;
  totalMusuhLolos: number;
  waktuMillis: number;
}

export interface EnemyState {
  id: string;
  word: string;
  typedIndex: number;
  hp: number;
  maxHp: number;
  position: [number, number, number];
  targetPosition: [number, number, number];
  alive: boolean;
  speed: number;
  letterStatuses: ('pending' | 'targeting' | 'correct' | 'wrong' | 'completed')[];
}

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface WaveConfig {
  difficulty: DifficultyLevel;
  enemyCount: number;
  spawnInterval: number;
  enemySpeed: number;
  wordLength: 'short' | 'medium' | 'long';
}
