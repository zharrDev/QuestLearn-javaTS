import { Soal } from '../types/soal.types'

let idCounter = 10000

// Word banks for English
const ENGLISH_VOCAB_BASIC = [
  { en: 'Apple', id: 'Apel', opts: ['Apel','Jeruk','Pisang','Anggur'] },
  { en: 'Book', id: 'Buku', opts: ['Buku','Meja','Kursi','Pintu'] },
  { en: 'Cat', id: 'Kucing', opts: ['Anjing','Kucing','Burung','Ikan'] },
  { en: 'House', id: 'Rumah', opts: ['Rumah','Sekolah','Pasar','Kantor'] },
  { en: 'Water', id: 'Air', opts: ['Air','Api','Tanah','Angin'] },
  { en: 'Sun', id: 'Matahari', opts: ['Matahari','Bulan','Bintang','Awan'] },
  { en: 'Blue', id: 'Biru', opts: ['Merah','Biru','Hijau','Kuning'] },
  { en: 'Good Morning', id: 'Selamat Pagi', opts: ['Selamat Pagi','Selamat Siang','Selamat Malam','Selamat Sore'] },
]

const ENGLISH_ADJ = [
  { q: 'The sky is ____ (beautiful)', a: 'beautiful', opts: ['beautiful','quickly','beautifully','beauty'], explain: 'beautiful = kata sifat' },
  { q: "Opposite of 'Happy' is ____", a: 'Sad', opts: ['Sad','Glad','Joyful','Excited'], explain: 'Happy vs Sad antonim' },
  { q: "'Diligent' means", a: 'Rajin', opts: ['Malas','Rajin','Cerdas','Lambat'], explain: 'Diligent = rajin' },
]

const ENGLISH_VERBS = [
  { q: 'Verb for Berlari is', a: 'Run', opts: ['Run','Walk','Jump','Sit'] },
  { q: 'Verb for Melompat is', a: 'Jump', opts: ['Run','Walk','Jump','Sit'] },
]

function randomPick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

export const questionGenerator = {
  english(level: number): Soal {
    idCounter++
    const lvl = level % 6
    if (lvl === 1 || lvl === 0) {
      const item = randomPick(ENGLISH_VOCAB_BASIC)
      const correctIdx = item.opts.indexOf(item.id)
      const letters = ['A','B','C','D']
      return {
        id: idCounter,
        levelId: 1,
        pertanyaan: `What is '${item.en}' in Indonesian?`,
        tipeSoal: 'PILIHAN_GANDA',
        opsiA: item.opts[0], opsiB: item.opts[1], opsiC: item.opts[2], opsiD: item.opts[3],
        jawabanBenar: letters[correctIdx],
        pembahasan: `${item.en} = ${item.id}`,
        xpPoint: 10,
        tingkatKesulitan: 'MUDAH',
      }
    } else if (lvl === 2) {
      const templates = [
        { q: 'I ____ (eat) breakfast every morning', ans: 'eat', opts: ['eats','eat','eating','ate'], exp: 'I/You/We/They + verb base' },
        { q: 'She ____ (go) to school every day', ans: 'goes', opts: ['go','goes','going','went'], exp: 'She + goes' },
        { q: 'They ____ football on Sunday', ans: 'play', opts: ['plays','playing','play','played'], exp: 'They play' },
      ]
      const t = randomPick(templates)
      const letters = ['A','B','C','D']
      const correctIdx = t.opts.indexOf(t.ans)
      return {
        id: idCounter,
        levelId: 2,
        pertanyaan: t.q,
        tipeSoal: 'PILIHAN_GANDA',
        opsiA: t.opts[0], opsiB: t.opts[1], opsiC: t.opts[2], opsiD: t.opts[3],
        jawabanBenar: letters[correctIdx >=0 ? correctIdx : 0],
        pembahasan: t.exp,
        xpPoint: 12,
        tingkatKesulitan: 'SEDANG',
      }
    } else {
      const item = randomPick(ENGLISH_ADJ)
      const letters = ['A','B','C','D']
      const correctIdx = item.opts.indexOf(item.a)
      return {
        id: idCounter,
        levelId: level,
        pertanyaan: item.q,
        tipeSoal: 'PILIHAN_GANDA',
        opsiA: item.opts[0], opsiB: item.opts[1], opsiC: item.opts[2], opsiD: item.opts[3],
        jawabanBenar: letters[correctIdx >=0 ? correctIdx : 0],
        pembahasan: item.explain,
        xpPoint: 12,
        tingkatKesulitan: 'SEDANG',
      }
    }
  },

  math(level: number): Soal {
    idCounter++
    const lvl = level % 6
    let q = '', ans = 0, opts: number[] = [], exp = ''
    if (lvl === 1) {
      const a = Math.floor(Math.random()*20)+1
      const b = Math.floor(Math.random()*20)+1
      const isAdd = Math.random() > 0.5
      if (isAdd) { q = `${a} + ${b} = ?`; ans = a+b; exp = `${a}+${b}=${ans}` }
      else { const max = Math.max(a,b); const min = Math.min(a,b); q = `${max} - ${min} = ?`; ans = max-min; exp = `${max}-${min}=${ans}` }
      opts = shuffle([ans, ans+1, ans-1, ans+2]).filter(n=>n>=0).slice(0,4)
      if (!opts.includes(ans)) opts[0]=ans
    } else if (lvl === 2) {
      const a = Math.floor(Math.random()*12)+2
      const b = Math.floor(Math.random()*10)+2
      const isMul = Math.random() > 0.5
      if (isMul) { q = `${a} × ${b} = ?`; ans = a*b; exp = `${a}x${b}=${ans}` }
      else { const prod = a*b; q = `${prod} ÷ ${a} = ?`; ans = b; exp = `${prod}:${a}=${b}` }
      opts = shuffle([ans, ans+1, ans+2, ans*2]).slice(0,4)
    } else if (lvl === 3) {
      const a = Math.floor(Math.random()*5)+1
      const b = Math.floor(Math.random()*5)+1
      const den = b + a
      q = `${a}/${den} + ${b}/${den} = ?`
      const num = a+b
      ans = num
      exp = `${a}/${den}+${b}/${den}=${num}/${den}`
      opts = [num, num+1, num-1, den].map(n=>n)
      return {
        id: idCounter,
        levelId: level,
        pertanyaan: q,
        tipeSoal: 'PILIHAN_GANDA',
        opsiA: `${opts[0]}/${den}`, opsiB: `${opts[1]}/${den}`, opsiC: `${opts[2]}/${den}`, opsiD: `${opts[3]}/${den}`,
        jawabanBenar: 'A',
        pembahasan: exp,
        xpPoint: 12,
        tingkatKesulitan: 'SEDANG',
      }
    } else if (lvl === 4) {
      const x = Math.floor(Math.random()*10)+1
      const c = Math.floor(Math.random()*10)+5
      q = `Jika x + ${x} = ${x + c}, maka x = ?`
      ans = c
      exp = `x = ${x + c} - ${x} = ${c}`
      opts = [c, c+1, c-1, c+2]
    } else {
      const s = Math.floor(Math.random()*10)+3
      q = `Luas persegi sisi ${s} cm = ? cm²`
      ans = s*s
      exp = `${s}x${s}=${ans}`
      opts = [ans, ans+s, s*4, s*2]
    }
    const letters = ['A','B','C','D']
    const shuffled = shuffle(opts)
    const correctIdx = shuffled.indexOf(ans)
    return {
      id: idCounter,
      levelId: level,
      pertanyaan: q,
      tipeSoal: 'PILIHAN_GANDA',
      opsiA: String(shuffled[0]), opsiB: String(shuffled[1]), opsiC: String(shuffled[2]), opsiD: String(shuffled[3]),
      jawabanBenar: letters[correctIdx >=0 ? correctIdx : 0],
      pembahasan: exp,
      xpPoint: level > 4 ? 20 : 12,
      tingkatKesulitan: level > 4 ? 'SULIT' : 'SEDANG',
    }
  },

  logic(level: number): Soal {
    idCounter++
    const lvl = level % 6
    if (lvl === 1) {
      // pola angka
      const start = Math.floor(Math.random()*5)+1
      const step = Math.floor(Math.random()*5)+2
      const seq = [start, start+step, start+step*2, start+step*3]
      const next = start+step*4
      const q = `Lanjutkan pola: ${seq.join(', ')}, ...`
      const opts = [next, next+1, next-1, next+step]
      const shuffled = shuffle(opts)
      const letters = ['A','B','C','D']
      return {
        id: idCounter,
        levelId: level,
        pertanyaan: q,
        tipeSoal: 'PILIHAN_GANDA',
        opsiA: String(shuffled[0]), opsiB: String(shuffled[1]), opsiC: String(shuffled[2]), opsiD: String(shuffled[3]),
        jawabanBenar: letters[shuffled.indexOf(next)],
        pembahasan: `Pola +${step} tiap langkah, selanjutnya ${next}`,
        xpPoint: 12,
        tingkatKesulitan: 'MUDAH',
      }
    } else if (lvl === 2) {
      const items = [
        { q: 'Jika hujan, jalan basah. Hujan turun. Maka?', ans: 'Jalan basah', opts: ['Jalan basah','Jalan kering','Tidak hujan','Tidak tahu'], exp: 'Modus ponens' },
        { q: 'Semua burung bisa terbang. Penguin adalah burung. Secara logika?', ans: 'Penguin bisa terbang (secara logika premis)', opts: ['Penguin bisa terbang (secara logika)','Penguin tidak burung','Tidak bisa disimpulkan','Semua burung penguin'], exp: 'Silogisme' },
        { q: 'Jika lampu mati, gelap. Tidak gelap. Maka?', ans: 'Lampu tidak mati', opts: ['Lampu tidak mati','Lampu mati','Gelap','Tidak tahu'], exp: 'Kontraposisi' },
      ]
      const t = randomPick(items)
      const letters = ['A','B','C','D']
      const shuffled = shuffle(t.opts)
      return {
        id: idCounter,
        levelId: level,
        pertanyaan: t.q,
        tipeSoal: 'PILIHAN_GANDA',
        opsiA: shuffled[0], opsiB: shuffled[1], opsiC: shuffled[2], opsiD: shuffled[3],
        jawabanBenar: letters[shuffled.indexOf(t.ans)],
        pembahasan: t.exp,
        xpPoint: 15,
        tingkatKesulitan: 'SEDANG',
      }
    } else {
      // teka-teki deduksi
      const puzzles = [
        { q: '3 orang duduk berderet. A di tengah, B di kiri A, posisi C?', ans: 'Kanan A', opts: ['Kanan A','Kiri B','Tengah','Tidak duduk'], exp: 'C di kanan A' },
        { q: 'Planet terbesar di Tata Surya?', ans: 'Jupiter', opts: ['Bumi','Jupiter','Mars','Saturnus'], exp: 'Jupiter terbesar' },
        { q: 'H2O adalah rumus?', ans: 'Air', opts: ['Air','Oksigen','Hidrogen','Karbon'], exp: 'Air = H2O' },
        { q: 'Jika semua A adalah B dan semua B adalah C, maka semua A adalah...?', ans: 'C', opts: ['C','B','A','D'], exp: 'Silogisme transitif' },
        { q: 'Lanjutkan Fibonacci: 1,1,2,3,5,8,...', ans: '13', opts: ['11','12','13','14'], exp: '5+8=13' },
      ]
      const t = randomPick(puzzles)
      const letters = ['A','B','C','D']
      const shuffled = shuffle(t.opts)
      return {
        id: idCounter,
        levelId: level,
        pertanyaan: t.q,
        tipeSoal: 'PILIHAN_GANDA',
        opsiA: shuffled[0], opsiB: shuffled[1], opsiC: shuffled[2], opsiD: shuffled[3],
        jawabanBenar: letters[shuffled.indexOf(t.ans)],
        pembahasan: t.exp,
        xpPoint: 15,
        tingkatKesulitan: 'SULIT',
      }
    }
  },

  generateForDunia(duniaId: number, levelId: number): Soal {
    if (duniaId === 1) return this.english(levelId)
    if (duniaId === 2) return this.math(levelId)
    return this.logic(levelId)
  },

  generateBatch(duniaId: number, levelId: number, count: number, excludeIds: Set<number> = new Set()): Soal[] {
    const batch: Soal[] = []
    for (let i = 0; i < count; i++) {
      let s: Soal
      let attempts = 0
      do {
        s = this.generateForDunia(duniaId, levelId)
        attempts++
      } while (excludeIds.has(s.id) && attempts < 10)
      batch.push(s)
    }
    return batch
  }
}
