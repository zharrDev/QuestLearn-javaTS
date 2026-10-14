export interface LeaderboardEntry {
  userId: number
  nama: string
  avatarUrl?: string
  totalXp: number
  /** Typing metric used for ranking. */
  wpm?: number
  akurasi?: number
  duniaNama?: string
  rank: number
}
