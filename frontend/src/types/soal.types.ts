
export interface Soal { id:number; levelId:number; levelNama?:string; pertanyaan:string; tipeSoal:string; opsiA?:string; opsiB?:string; opsiC?:string; opsiD?:string; jawabanBenar:string; pembahasan?:string; gambarUrl?:string; xpPoint:number; tingkatKesulitan:string; createdAt?:string }
export interface SoalRequest { levelId:number; pertanyaan:string; tipeSoal?:string; opsiA?:string; opsiB?:string; opsiC?:string; opsiD?:string; jawabanBenar:string; pembahasan?:string; tingkatKesulitan?:string; xpPoint?:number }
export interface SubmitQuestRequest { levelId:number; jawaban:{soalId:number; jawabanUser:string}[] }
