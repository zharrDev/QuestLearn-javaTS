
export interface Dunia { id:number; nama:string; slug:string; deskripsi:string; iconUrl?:string; backgroundColor:string; urutan:number; isActive:boolean; totalLevel?:number; completedLevel?:number; createdAt?:string }
export interface DuniaRequest { nama:string; deskripsi?:string; backgroundColor?:string; urutan?:number; isActive?:boolean }
