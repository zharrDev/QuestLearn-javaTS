export interface Dashboard {
  totalXp: number
  currentStreak: number
  longestStreak: number
  completedLevels: number
  totalLevels: number
  totalBadges: number
  continueLearning: { id: number; nama: string; deskripsi: string }[]
  recentBadges: import('./badge.types').Badge[]
  leaderboardWeekly: import('./leaderboard.types').LeaderboardEntry[]
}
