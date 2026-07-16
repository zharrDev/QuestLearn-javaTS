
export interface User { id:number; email:string; nama:string; role:'ADMIN'|'SISWA'; totalXp:number; currentStreak:number; avatarUrl?:string }
export interface JwtResponse { token:string; id:number; email:string; nama:string; role:string; totalXp:number; currentStreak:number }
export interface LoginRequest { email:string; password:string }
export interface RegisterRequest { nama:string; email:string; password:string; confirmPassword:string }
