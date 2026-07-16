
export interface Badge { id:number; nama:string; kode:string; deskripsi?:string; iconUrl?:string; warna:string; syaratType?:string; syaratValue?:number; earned?:boolean; earnedAt?:string }
export interface BadgeRequest { nama:string; kode:string; deskripsi?:string; warna?:string; syaratType?:string; syaratValue?:number; xpBonus?:number }
