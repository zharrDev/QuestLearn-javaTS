
export const formatXP = (xp: number) => xp >= 1000 ? `${(xp/1000).toFixed(1)}k` : xp.toString()
export const formatDate = (s?: string) => s ? new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) : '-'
