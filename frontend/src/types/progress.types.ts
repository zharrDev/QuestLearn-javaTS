
export interface JawabanDetail { soalId:number; pertanyaan:string; jawabanUser:string; jawabanBenar:string; isBenar:boolean; pembahasan?:string }
export interface Progress { id:number; levelId:number; levelNama:string; duniaNama?:string; skor:number; totalSoal:number; jawabanBenar:number; isLulus:boolean; percobaanKe:number; xpDidapat:number; waktuMulai?:string; waktuSelesai?:string; jawabanDetails?:JawabanDetail[] }
export interface Dashboard { totalXp:number; currentStreak:number; longestStreak:number; completedLevels:number; totalLevels:number; totalBadges:number; continueLearning: import('./level.types').Level[]; recentBadges: import('./badge.types').Badge[]; leaderboardWeekly: import('./leaderboard.types').LeaderboardEntry[] }
