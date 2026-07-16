
export interface Level { id:number; duniaId:number; duniaNama?:string; nama:string; deskripsi?:string; urutan:number; xpReward:number; minScoreLulus:number; isBossLevel:boolean; isActive:boolean; totalSoal?:number; status?:'LOCKED'|'OPEN'|'COMPLETED'; createdAt?:string }
export interface LevelRequest { duniaId:number; nama:string; deskripsi?:string; urutan:number; xpReward?:number; minScoreLulus?:number; isBossLevel?:boolean; isActive?:boolean }
