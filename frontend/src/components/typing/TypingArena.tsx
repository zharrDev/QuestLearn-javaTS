import { useRef, useEffect, useState, useCallback } from "react";
import type { EnemyState, DifficultyLevel } from "../../types/typing.types";
import { GAME_CONSTANTS, CFG, THEMES, GROUND_RATIO, ANIM } from "../../config/game.config";

type PState = "idle" | "run" | "jump" | "slash" | "block" | "finisher";

interface ArenaProps {
  words: string[];
  difficulty: DifficultyLevel;
  duniaId: number;
  duniaNama: string;
  durationSec: 30 | 60 | 300;
  onSessionEnd: (result: {
    skor: number;
    wpm: number;
    akurasi: number;
    comboTerpanjang: number;
    totalMusuhKalah: number;
    totalMusuhLolos: number;
    waktuMillis: number;
  }) => void;
}

function uid() {
  return Math.random().toString(36).substring(2, 9);
}

const LETTER_SPACING = GAME_CONSTANTS.LETTER_SPACING;
const MIN_ENEMY_GAP = GAME_CONSTANTS.MIN_ENEMY_GAP;

const loaded: Record<string, HTMLImageElement> = {};
function ld(src: string): Promise<void> {
  if (loaded[src]) return Promise.resolve();
  return new Promise((r) => {
    const i = new Image();
    i.onload = () => {
      loaded[src] = i;
      r();
    };
    i.onerror = () => r();
    i.src = src;
  });
}
function gi(src: string) {
  return loaded[src] || null;
}

const fCache: Record<string, HTMLImageElement[]> = {};
function gf(key: string): HTMLImageElement[] {
  if (fCache[key]) return fCache[key];
  const a = ANIM[key as keyof typeof ANIM];
  if (!a) return [];
  const arr: HTMLImageElement[] = [];
  for (let i = 1; i <= a.cnt; i++) {
    const n = i < 10 ? `0${i}` : `${i}`;
    const f = gi(`/assets/${a.pre}${n}.png`);
    if (f) arr.push(f);
  }
  if (arr.length === a.cnt) fCache[key] = arr;
  return arr;
}

function preloadAll() {
  const all: Promise<void>[] = [];
  for (const [k, v] of Object.entries(ANIM))
    for (let i = 1; i <= v.cnt; i++)
      all.push(ld(`/assets/${v.pre}${i < 10 ? `0${i}` : i}.png`));
  for (const t of Object.values(THEMES)) {
    all.push(ld(t.bgFile));
    all.push(ld(t.boxFile));
  }
  return Promise.all(all);
}

interface G {
  en: EnemyState[];
  score: number;
  combo: number;
  maxCombo: number;
  kills: number;
  missed: number;
  tKeys: number;
  cKeys: number;
  over: boolean;
  state: PState;
  py: number;
  pvy: number;
  gy: number;
  parts: PArt[];
  slsh: SLsh[];
  floatTxts: FloatT[];
  t0: number;
  wv: number;
  wvLeft: number;
  shX: number;
  shT: number;
  wpm: number;
  acc: number;
  animT: number;
  endT: number;
  stateT: number;
  jumping: boolean;
  camX: number;
  // Jarak "lunge" karakter dari posisi jaga (px, 0 = di posisi jaga).
  lunge: number;
  homeScreenX: number;
  viewW: number;
  hp: number;
  maxHp: number;
  totalKilledTarget: number;
  dashing: boolean;
  dashTarget: number;
  dashPhase: "" | "approach" | "attack";
  timeLeft: number;
  durationSec: number;
  pendingTarget: { enemy: EnemyState; letterIdx: number } | null;
  difficulty: DifficultyLevel;
  started: boolean;
  // Anti-repetition word pool (reshuffled only once it is exhausted).
  pool: string[];
  lastWord: string;
  // The box that should have been slashed when a wrong key was pressed.
  wrongFlash: { enemyId: string; idx: number; t0: number } | null;
}
interface PArt {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  sz: number;
}
interface SLsh {
  id: string;
  x: number;
  y: number;
  t0: number;
  life: number;
}
interface FloatT {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

export default function TypingArena({
  words,
  difficulty,
  duniaId,
  duniaNama,
  durationSec,
  onSessionEnd,
}: ArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<G>(null!);
  const raf = useRef(0);
  const alive = useRef(true);
  const cbRef = useRef(onSessionEnd);
  cbRef.current = onSessionEnd;
  const cfg = CFG[difficulty];

  const [hud, setHud] = useState({
    score: 0,
    combo: 0,
    maxCombo: 0,
    kills: 0,
    missed: 0,
    hp: cfg.hearts,
    maxHp: cfg.hearts,
    wave: 1,
    wpm: 0,
    acc: 100,
    over: false,
    timeLeft: 0,
    durationSec: 30,
    progress: 100,
    started: false,
  });

  useEffect(() => {
    alive.current = true;
    preloadAll();
    const g: G = {
      en: [],
      score: 0,
      combo: 0,
      maxCombo: 0,
      kills: 0,
      missed: 0,
      tKeys: 0,
      cKeys: 0,
      over: false,
      state: "idle",
      py: 0,
      pvy: 0,
      gy: 0,
      parts: [],
      slsh: [],
      floatTxts: [],
      t0: 0,
      wv: 1,
      wvLeft: cfg.waveSz,
      shX: 0,
      shT: 0,
      wpm: 0,
      acc: 100,
      animT: 0,
      endT: 0,
      stateT: 0,
      jumping: false,
      camX: 0,
      lunge: 0,
      homeScreenX: 160,
      viewW: 1280,
      hp: cfg.hearts,
      maxHp: cfg.hearts,
      totalKilledTarget: 0,
      dashing: false,
      dashTarget: 0,
      dashPhase: "",
      timeLeft: durationSec,
      durationSec,
      pendingTarget: null,
      difficulty,
      started: false,
      pool: [],
      lastWord: "",
      wrongFlash: null,
    };
    gRef.current = g;
    return () => {
      alive.current = false;
      cancelAnimationFrame(raf.current);
    };
  }, []);

  // Anti-repetition: draw from a shuffled pool so a word cannot reappear until the
  // whole bank has been used (spec section 4), instead of a random pick with
  // replacement that could repeat the same word back-to-back.
  function pickWord(g: G): string {
    if (g.pool.length === 0) {
      const shuffled = [...words];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      // Don't let the new cycle open with the previous cycle's last word.
      if (shuffled.length > 1 && shuffled[shuffled.length - 1] === g.lastWord) {
        [shuffled[shuffled.length - 1], shuffled[0]] = [
          shuffled[0],
          shuffled[shuffled.length - 1],
        ];
      }
      g.pool = shuffled;
    }
    const w = g.pool.pop() as string;
    g.lastWord = w;
    return w;
  }

  function spawnEnAt(g: G, wx: number): EnemyState {
    const word = pickWord(g);
    const rx = Math.random();
    const ranges = [
      { max: 0.35, min: 28, var: 12 },
      { max: 0.65, min: 80, var: 18 },
      { max: 1.0, min: 95, var: 20 },
    ];
    const r = ranges.find((r) => rx < r.max) || ranges[2];
    let y = g.gy - r.min - Math.random() * r.var;
    for (let a = 0; a < 10; a++) {
      let ok = true;
      for (const e of g.en)
        if (e.alive && Math.abs(e.position[1] - y) < 50) {
          ok = false;
          break;
        }
      if (ok) break;
      y = g.gy - r.min - Math.random() * r.var;
    }
    return {
      id: uid(),
      word,
      typedIndex: 0,
      hp: word.length,
      maxHp: word.length,
      position: [wx, y, 0],
      targetPosition: [0, 0, 0],
      alive: true,
      speed: 0,
      letterStatuses: word.split("").map(() => "pending" as const),
    };
  }

  // Spawn satu musuh baru. Saat sesi sudah jalan, musuh muncul dari sisi KANAN layar
  // (mengikuti kamera) lalu bergerak mendekat ke karakter. Saat belum mulai, musuh
  // disebar dulu di layar supaya langsung kelihatan.
  // Jarak X antar musuh dihitung dari PANJANG KATA masing-masing supaya kata panjang
  // tidak numpuk dengan musuh berikutnya (bug "huruf dobel/ketumpuk").
  function spawnNext(g: G) {
    const alive = g.en.filter((e) => e.alive);
    let x = g.started
      ? g.camX + g.viewW + 80
      : g.camX + g.viewW * 0.42 + alive.length * 300;
    for (const e of alive) {
      const rightEdge =
        e.position[0] + (e.word.length - 1 - e.typedIndex) * LETTER_SPACING;
      const minX = rightEdge + LETTER_SPACING + MIN_ENEMY_GAP;
      if (minX > x) x = minX;
    }
    const en = spawnEnAt(g, x);
    g.en.push(en);
    return en;
  }

  // Dipakai saat sesi baru mulai / wave lama habis total: isi ulang beberapa musuh
  // sekaligus TAPI tetap satu-satu lewat spawnNext supaya jaraknya tetap dinamis.
  function spawnWave(g: G) {
    const batch = Math.min(cfg.maxEn, 4);
    for (let i = 0; i < batch; i++) spawnNext(g);
    g.wvLeft = batch;
  }

  function addFloatText(
    g: G,
    x: number,
    y: number,
    text: string,
    color: string,
  ) {
    g.floatTxts.push({
      id: uid(),
      x,
      y,
      text,
      color,
      life: 0,
      maxLife: 0.8 + Math.random() * 0.3,
      vy: -80 - Math.random() * 40,
    });
  }

  function addP(g: G, x: number, y: number, c: string, n = 6) {
    for (let i = 0; i < n; i++)
      g.parts.push({
        id: uid(),
        x,
        y,
        vx: (Math.random() - 0.5) * 200,
        vy: -Math.random() * 260 - 40,
        life: 0,
        maxLife: 0.3 + Math.random() * 0.3,
        color: c,
        sz: 3 + Math.random() * 4,
      });
  }

  const onKey = useCallback((e: KeyboardEvent) => {
    const g = gRef.current;
    if (!g || g.over) return;
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    g.tKeys++;
    if (!g.started) {
      g.t0 = Date.now();
      g.started = true;
    }
    const ch = e.key.toLowerCase();
    const aliveEn = g.en.filter((e) => e.alive && e.typedIndex < e.word.length);
    const match = aliveEn.filter(
      (e) => e.word[e.typedIndex].toLowerCase() === ch,
    );
    if (match.length > 0) {
      // Semua musuh selalu ada di depan karakter, jadi yang paling kiri = paling dekat.
      match.sort((a, b) => a.position[0] - b.position[0]);
      const t = match[0];

      // Cancel current dash if targeting a different enemy
      if (g.pendingTarget) {
        const pt = g.pendingTarget;
        if (pt.enemy.id !== t.id) {
          pt.enemy.letterStatuses[pt.letterIdx] = "pending";
          g.pendingTarget = null;
        } else {
          // Same enemy already being targeted — ignore duplicate
          return;
        }
      }

      g.cKeys++;
      g.combo++;
      if (g.combo > g.maxCombo) g.maxCombo = g.combo;

      const idx = t.typedIndex;
      t.letterStatuses[idx] = "targeting";
      g.pendingTarget = { enemy: t, letterIdx: idx };

      g.dashing = true;
      // Target lunge dihitung relatif ke posisi jaga karakter (layar), bukan world x,
      // dan dibatasi supaya karakter tidak lari keluar layar.
      g.dashTarget = Math.max(
        0,
        Math.min(
          t.position[0] - g.camX - g.homeScreenX - 40,
          g.viewW * 0.5,
        ),
      );
      g.dashPhase = "approach";
      g.state = "run";
      g.stateT = Date.now();
      g.animT = 0;

      if (t.position[1] < g.gy - 55 && !g.jumping) {
        g.jumping = true;
        g.pvy = -480;
        g.state = "jump";
      }
    } else {
      // Spec 2.3: the box that should have been slashed blinks red and the character
      // holds a brief block/parry pose; the group keeps advancing meanwhile.
      const nearest = aliveEn.slice().sort((a, b) => a.position[0] - b.position[0])[0];
      if (nearest) {
        g.wrongFlash = { enemyId: nearest.id, idx: nearest.typedIndex, t0: Date.now() };
      }
      g.combo = 0;
      g.shT = 4;
      if (!g.dashing) {
        g.state = "block";
        g.stateT = Date.now();
        g.animT = 0;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  useEffect(() => {
    const iv = setInterval(() => {
      const g = gRef.current;
      if (!g) return;
      const el = Date.now() - g.t0;
      const min = el / 60000;
      if (min > 0) g.wpm = Math.round((g.kills * 5) / min);
      g.acc = g.tKeys > 0 ? Math.round((g.cKeys / g.tKeys) * 100) : 100;
      const prog =
        g.durationSec > 0 ? Math.round((g.timeLeft / g.durationSec) * 100) : 0;
      setHud({
        score: g.score,
        combo: g.combo,
        maxCombo: g.maxCombo,
        kills: g.kills,
        missed: g.missed,
        hp: g.hp,
        maxHp: g.maxHp,
        wave: g.wv,
        wpm: g.wpm,
        acc: g.acc,
        over: g.over,
        timeLeft: Math.ceil(g.timeLeft),
        durationSec: g.durationSec,
        progress: prog,
        started: g.started,
      });
    }, 300);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    const wr = wrapRef.current;
    if (!cv || !wr) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const cvs: HTMLCanvasElement = cv;
    const wrap: HTMLDivElement = wr;
    const cctx: CanvasRenderingContext2D = ctx;

    function resize() {
      const r = wrap.getBoundingClientRect();
      cvs.width = r.width;
      cvs.height = r.height;
    }
    resize();
    window.addEventListener("resize", resize);

    function drawBg(w: number, h: number, g: G) {
      const t = THEMES[duniaId];
      const gr = cctx.createLinearGradient(0, 0, 0, h);
      const skyTops: Record<number, string> = {
        1: "#1a2a4a",
        2: "#4a2a1a",
        3: "#0a1a0a",
      };
      const skyBots: Record<number, string> = {
        1: "#4a7aaa",
        2: "#8a6a3a",
        3: "#2a4a2a",
      };
      gr.addColorStop(0, skyTops[duniaId] || "#1a2a4a");
      gr.addColorStop(1, skyBots[duniaId] || "#4a7aaa");
      cctx.fillStyle = gr;
      cctx.fillRect(0, 0, w, h);
      const b = gi(t.bgFile);
      if (b) {
        const sc = Math.max(w / b.width, h / b.height);
        const bw = b.width * sc;
        const bh = b.height * sc;
        const pan = (g.camX * 0.15) % bw;
        cctx.drawImage(
          b,
          0,
          0,
          b.width,
          b.height,
          Math.round(-pan),
          Math.round((h - bh) / 2),
          Math.ceil(bw),
          Math.ceil(bh),
        );
        cctx.drawImage(
          b,
          0,
          0,
          b.width,
          b.height,
          Math.round(bw - pan),
          Math.round((h - bh) / 2),
          Math.ceil(bw),
          Math.ceil(bh),
        );
      }
      // Ground line dikalibrasi per tema (lihat GROUND_RATIO di atas), bukan angka
      // tetap 0.8 — ini yang memperbaiki bug karakter "melayang" di atas tanah.
      g.gy = h * (GROUND_RATIO[duniaId] || 0.8);
    }

    function drawBoxes(g: G) {
      const box = gi(THEMES[duniaId].boxFile);
      cctx.font = '20px "Press Start 2P", monospace';
      cctx.textAlign = "center";
      cctx.textBaseline = "middle";
      for (const en of g.en) {
        if (!en.alive) continue;
        const sx = en.position[0] - g.camX;
        if (sx < -120 || sx > cvs.width + 120) continue;
        const chars = en.word.split("");
        for (let i = 0; i < chars.length; i++) {
          if (i < en.typedIndex && en.letterStatuses[i] === "correct") continue;
          const ox = (i - en.typedIndex) * LETTER_SPACING;
          const fx = sx + ox;
          cctx.save();
          cctx.translate(fx, en.position[1]);
          const sz = 60;
          cctx.fillStyle = "rgba(0,0,0,0.45)";
          cctx.fillRect(-sz / 2 - 4, -sz / 2 - 4, sz + 8, sz + 8);
          if (box) {
            cctx.drawImage(box, -sz / 2, -sz / 2, sz, sz);
          } else {
            cctx.fillStyle = "#5a4a3a";
            cctx.fillRect(-sz / 2, -sz / 2, sz, sz);
            cctx.strokeStyle = "#3a2a1a";
            cctx.lineWidth = 1;
            cctx.strokeRect(-sz / 2, -sz / 2, sz, sz);
          }

          const isTargeting = en.letterStatuses[i] === "targeting";
          const isPendingTarget =
            i === en.typedIndex && en.letterStatuses[i] === "pending";
          const wf = g.wrongFlash;
          const wrongAge =
            wf && wf.enemyId === en.id && wf.idx === i ? Date.now() - wf.t0 : Infinity;
          const isWrongFlash = wrongAge < 320;

          if (isWrongFlash) {
            const blink = Math.floor(wrongAge / 90) % 2 === 0;
            cctx.shadowColor = "#ff2222";
            cctx.shadowBlur = blink ? 26 : 6;
            cctx.strokeStyle = blink ? "#ff2222" : "#aa1111";
            cctx.lineWidth = 5;
            cctx.strokeRect(-sz / 2 - 6, -sz / 2 - 6, sz + 12, sz + 12);
            cctx.shadowBlur = 0;
            cctx.fillStyle = `rgba(255,34,34,${blink ? 0.35 : 0.15})`;
            cctx.fillRect(-sz / 2 - 4, -sz / 2 - 4, sz + 8, sz + 8);
          } else if (isTargeting) {
            cctx.shadowColor = "#ff8800";
            cctx.shadowBlur = 25;
            cctx.strokeStyle = "#ff8800";
            cctx.lineWidth = 4;
            cctx.strokeRect(-sz / 2 - 5, -sz / 2 - 5, sz + 10, sz + 10);
            cctx.shadowBlur = 0;
            cctx.fillStyle = "rgba(255,136,0,0.15)";
            cctx.fillRect(-sz / 2 - 3, -sz / 2 - 3, sz + 6, sz + 6);
          } else if (isPendingTarget) {
            cctx.shadowColor = "#ffff00";
            cctx.shadowBlur = 20;
            cctx.strokeStyle = "#ffff00";
            cctx.lineWidth = 3;
            cctx.strokeRect(-sz / 2 - 4, -sz / 2 - 4, sz + 8, sz + 8);
            cctx.shadowBlur = 0;
          }

          cctx.strokeStyle = "#000";
          cctx.lineWidth = 4;
          cctx.strokeText(chars[i] === " " ? "_" : chars[i], 0, 1);
          cctx.fillStyle = "#fff";
          cctx.shadowColor = "rgba(0,0,0,0.9)";
          cctx.shadowBlur = 8;
          cctx.fillText(chars[i] === " " ? "_" : chars[i], 0, 1);
          cctx.shadowBlur = 0;
          cctx.restore();
        }
      }
    }

    function drawChar(g: G) {
      const baseY = g.gy;
      const homeScreenX = Math.round(cvs.width * 0.12);
      g.homeScreenX = homeScreenX;

      // Dunia terus bergerak ke kiri selama sesi jalan → efek karakter berlari
      // menyusuri level (side-scroller), sekaligus jadi dasar garis pertahanan.
      if (g.started && !g.over) g.camX += cfg.worldSpd / 60;

      if (g.dashing) {
        if (g.dashPhase === "approach") {
          // Ikuti terus posisi kotak target — musuh juga terus bergerak mendekat.
          if (g.pendingTarget) {
            g.dashTarget = Math.max(
              0,
              Math.min(
                g.pendingTarget.enemy.position[0] -
                  g.camX -
                  homeScreenX -
                  40,
                cvs.width * 0.5,
              ),
            );
          }
          const dx = g.dashTarget - g.lunge;
          if (Math.abs(dx) > 14) {
            // Ease-out: makin dekat ke target, makin pelan gerakannya — terasa lebih
            // "natural" daripada gerak linear/patah di ujung.
            const easeAmount = Math.min(
              Math.max(Math.abs(dx) * 0.16, 5),
              cfg.dashSpd / 20,
            );
            g.lunge += Math.sign(dx) * easeAmount;
          } else {
            g.dashPhase = "attack";
            g.state = "slash";
            g.stateT = Date.now();
            g.animT = 0;

            // Execute pending target — slash the box now
            if (g.pendingTarget) {
              const pt = g.pendingTarget;
              const en = pt.enemy;
              const li = pt.letterIdx;
              en.letterStatuses[li] = "correct";
              const bx = en.position[0] + (li - en.typedIndex) * LETTER_SPACING;
              const by = en.position[1];
              g.slsh.push({
                id: uid(),
                x: bx,
                y: by,
                t0: Date.now(),
                life: 120,
              });
              addP(g, bx, by, "#4ade80", 5);
              if (li + 1 >= en.word.length) {
                const mult =
                  g.difficulty === "HARD"
                    ? 3
                    : g.difficulty === "MEDIUM"
                      ? 2
                      : 1;
                const pts = Math.round(
                  en.word.length *
                    10 *
                    mult *
                    (1 + Math.floor(g.combo / 10) * 0.5),
                );
                g.score += pts;
                g.kills++;
                en.alive = false;
                en.hp = 0;
                g.totalKilledTarget++;
                addP(g, bx, by, "#fbbf24", 14);
                addFloatText(g, bx, by, `+${pts}`, "#fbbf24");
                // Word cleared -> play the finisher pose (spec 2.4/2.5).
                g.state = "finisher";
                g.stateT = Date.now();
                g.animT = 0;
              } else {
                en.typedIndex++;
              }
              g.pendingTarget = null;
            }
          }
        } else if (g.dashPhase === "attack") {
        }
      } else {
        // Setelah menebas / saat menganggur, karakter menarik diri kembali ke posisi
        // jaga sambil memainkan animasi lari.
        if (g.lunge > 2) {
          g.lunge *= 0.85;
          if (!g.jumping) g.state = "run";
        } else {
          g.lunge = 0;
          if (g.state === "run" && !g.jumping) g.state = "idle";
        }
      }

      if (g.jumping) {
        g.pvy += 1200 / 60;
        g.py += g.pvy / 60;
        if (g.py >= baseY - 4) {
          g.py = baseY - 4;
          g.jumping = false;
          g.pvy = 0;
          if (g.state === "jump") g.state = "idle";
          g.animT = 0;
        }
      } else {
        g.py = baseY - 4;
      }

      // Posisi karakter di layar = posisi jaga + jarak lunge (selalu di dalam layar).
      const screenX = homeScreenX + g.lunge;

      g.animT += 0.04;

      const bob =
        !g.jumping && g.state === "run"
          ? Math.sin(g.animT * 10) * 2.5
          : g.state === "slash"
            ? Math.sin(g.animT * 16) * 0.5
            : g.jumping
              ? 0
              : Math.sin(g.animT * 1.5) * 0.4;
      const tilt =
        g.state === "run"
          ? Math.sin(g.animT * 10) * 0.05
          : g.jumping
            ? -0.25
            : g.state === "slash"
              ? -0.12
              : 0;

      cctx.save();
      cctx.fillStyle = "rgba(0,0,0,0.15)";
      cctx.beginPath();
      cctx.ellipse(
        screenX - (g.dashing ? (g.dashTarget - g.lunge) * 0.2 : 0),
        baseY + 2,
        22,
        3,
        0,
        0,
        Math.PI * 2,
      );
      cctx.fill();

      const sc = g.state === "finisher" ? 2.9 : 2.5;
      const dustOn =
        g.state === "run" && !g.jumping && Math.sin(g.animT * 10) > 0.7;
      if (dustOn) {
        cctx.fillStyle = "rgba(180,160,120,0.3)";
        cctx.fillRect(screenX - 10, baseY - 2, 4, 3);
        cctx.fillRect(screenX + 6, baseY - 1, 3, 2);
      }

      cctx.translate(screenX, g.py + bob);
      cctx.rotate(tilt);

      let frames: HTMLImageElement[] = [];
      let fi = 0;
      if (g.jumping) {
        frames = gf("jump");
        fi = Math.floor(g.animT * 8) % Math.max(1, frames.length);
      } else if (g.state === "run") {
        frames = gf("run");
        fi = Math.floor(g.animT * 10) % Math.max(1, frames.length);
      } else if (g.state === "finisher") {
        frames = gf("slash");
        fi = Math.floor(g.animT * 12) % Math.max(1, frames.length);
      } else if (g.state === "slash") {
        frames = gf("slash");
        fi = Math.floor(g.animT * 22) % Math.max(1, frames.length);
      } else if (g.state === "block") {
        frames = gf("idle");
        fi = 0;
      } else {
        frames = gf("idle");
        fi = Math.floor(g.animT * 5) % Math.max(1, frames.length);
      }

      if (frames.length > 0 && fi < frames.length) {
        const f = frames[fi];
        cctx.drawImage(
          f,
          (-f.width * sc) / 2,
          -f.height * sc + 4,
          f.width * sc,
          f.height * sc,
        );
      } else {
        cctx.fillStyle = "#ff00ff";
        cctx.fillRect(-26, -56, 52, 70);
      }

      // There is no dedicated block sprite yet, so the parry shield is drawn in code.
      if (g.state === "block") {
        cctx.strokeStyle = "rgba(120,200,255,0.85)";
        cctx.lineWidth = 3;
        cctx.beginPath();
        cctx.arc(0, -22, 34, -Math.PI * 0.8, -Math.PI * 0.2);
        cctx.stroke();
      }
      cctx.restore();
    }

    function drawFX(g: G) {
      const now = Date.now();
      const cx = g.camX;
      for (const p of g.parts) {
        const prog = p.life / p.maxLife;
        cctx.globalAlpha = 1 - prog;
        cctx.fillStyle = p.color;
        cctx.fillRect(p.x - cx - p.sz / 2, p.y - p.sz / 2, p.sz, p.sz);
      }
      cctx.globalAlpha = 1;
      for (const s of g.slsh) {
        const age = now - s.t0;
        const prog = Math.min(age / s.life, 1);
        if (prog >= 1) continue;
        cctx.save();
        cctx.globalAlpha = 1 - prog;
        cctx.strokeStyle = "#4ade80";
        cctx.lineWidth = 3;
        cctx.translate(s.x - cx, s.y);
        cctx.rotate(age * 0.03);
        const len = 32 * (1 - prog * 0.3);
        cctx.beginPath();
        cctx.moveTo(-len, 0);
        cctx.lineTo(len, 0);
        cctx.stroke();
        if (prog < 0.4) {
          cctx.strokeStyle = "#fff";
          cctx.lineWidth = 1.5;
          cctx.beginPath();
          cctx.moveTo(-len * 0.4, -len * 0.2);
          cctx.lineTo(len * 0.4, len * 0.2);
          cctx.stroke();
        }
        cctx.restore();
      }
      for (const ft of g.floatTxts) {
        const prog = ft.life / ft.maxLife;
        if (prog >= 1) continue;
        cctx.save();
        cctx.globalAlpha = 1 - prog;
        cctx.fillStyle = ft.color;
        cctx.font = 'bold 16px "Press Start 2P", monospace';
        cctx.textAlign = "center";
        cctx.textBaseline = "middle";
        cctx.shadowColor = "rgba(0,0,0,0.8)";
        cctx.shadowBlur = 4;
        cctx.fillText(ft.text, ft.x - cx, ft.y);
        cctx.restore();
      }
      cctx.globalAlpha = 1;
    }

    function drawComboPopup(g: G) {
      if (g.combo >= 3) {
        const x = cvs.width / 2;
        const y = cvs.height * 0.3;
        cctx.save();
        const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.06;
        cctx.font = `${Math.round(18 * pulse)}px "Press Start 2P", monospace`;
        cctx.textAlign = "center";
        cctx.textBaseline = "middle";
        cctx.shadowColor = "rgba(255,200,0,0.5)";
        cctx.shadowBlur = 20;
        cctx.fillStyle =
          g.combo >= 10 ? "#ff4444" : g.combo >= 5 ? "#ffaa00" : "#ffff44";
        cctx.fillText(`COMBO x${g.combo}`, x, y);
        cctx.shadowBlur = 0;
        cctx.restore();
      }
    }

    function frame() {
      if (!alive.current) return;
      const w = cvs.width;
      const h = cvs.height;
      const g = gRef.current;
      const now = Date.now();

      // NOTE: g.gy sekarang di-set di dalam drawBg() (pakai GROUND_RATIO per tema),
      // jadi baris lama "g.gy = h * 0.8" di sini SUDAH DIHAPUS — jangan ditambah balik,
      // nanti nimpa hasil kalibrasi ground per tema.

      // Timer
      if (!g.over && g.started) {
        const elapsed = (now - g.t0) / 1000;
        g.timeLeft = Math.max(0, g.durationSec - elapsed);
        if (g.timeLeft <= 0) {
          g.over = true;
          g.endT = now;
          const el = now - g.t0;
          const min = el / 60000;
          g.wpm = min > 0 ? Math.round((g.kills * 5) / min) : 0;
          g.acc = g.tKeys > 0 ? Math.round((g.cKeys / g.tKeys) * 100) : 0;
        }
      }

      if (g.over && g.endT > 0 && now - g.endT > 1200) {
        const el = now - g.t0;
        const min = el / 60000;
        const fwpm = min > 0 ? Math.round((g.kills * 5) / min) : 0;
        const facc = g.tKeys > 0 ? Math.round((g.cKeys / g.tKeys) * 100) : 0;
        g.wpm = fwpm;
        g.acc = facc;
        cbRef.current({
          skor: g.score,
          wpm: fwpm,
          akurasi: facc,
          comboTerpanjang: g.maxCombo,
          totalMusuhKalah: g.kills,
          totalMusuhLolos: g.missed,
          waktuMillis: el,
        });
        return;
      }

      if (!g.over) {
        g.viewW = w;
        // Pastikan garis tanah sudah terhitung sebelum spawn musuh di frame pertama
        // (drawBg() juga men-set nilai yang sama — rumusnya harus konsisten).
        g.gy = h * (GROUND_RATIO[duniaId] || 0.8);

        // Jaga jumlah musuh AKTIF di layar tetap terbatas, nambah SATU-SATU lewat
        // spawnNext (jarak dinamis sesuai panjang kata) tiap kali ada slot kosong.
        g.en = g.en.filter((e) => e.alive);
        const targetOnScreen = cfg.onScreen;
        while (g.en.filter((e) => e.alive).length < targetOnScreen) {
          spawnNext(g);
        }

        // Nomor WAVE di HUD dihitung dari total kill.
        g.wv = 1 + Math.floor(g.totalKilledTarget / cfg.waveSz);

        // ==== TEKANAN WAKTU: musuh bergerak mendekat ke garis pertahanan ====
        // Kalau ada kotak yang nyampe garis jaga (belum habis ditebas), grup itu
        // dianggap LOLOS: -1 nyawa, combo reset, screen shake. Nyawa habis = game over.
        if (g.started) {
          const worldDrift = (cfg.enemySpd - cfg.worldSpd) / 60;
          for (const en of g.en) en.position[0] -= worldDrift;

          const defendX = g.camX + g.homeScreenX;
          for (const en of g.en) {
            if (!en.alive) continue;
            if (g.pendingTarget && g.pendingTarget.enemy.id === en.id) continue;
            if (en.position[0] <= defendX) {
              en.alive = false;
              g.combo = 0;
              g.missed++;
              g.hp = Math.max(0, g.hp - 1);
              g.shT = 8;
              addP(g, en.position[0], en.position[1], "#ef4444", 14);
              addFloatText(g, en.position[0], en.position[1], "MISS!", "#ef4444");
              if (g.hp <= 0) {
                g.over = true;
                g.endT = now;
              }
            }
          }
        }

        for (const p of g.parts) {
          p.life += 1 / 60;
          p.x += p.vx / 60;
          p.y += p.vy / 60;
          p.vy += 300 / 60;
        }
        g.parts = g.parts.filter((p) => p.life < p.maxLife);
        g.slsh = g.slsh.filter((s) => now - s.t0 < s.life);
        for (const ft of g.floatTxts) {
          ft.life += 1 / 60;
          ft.y += ft.vy / 60;
        }
        g.floatTxts = g.floatTxts.filter((ft) => ft.life < ft.maxLife);
        if (g.shT > 0) g.shT *= 0.92;
        if (g.shT < 0.1) g.shT = 0;
        if (
          g.dashPhase === "attack" &&
          (g.state === "slash" || g.state === "finisher") &&
          now - g.stateT > (g.state === "finisher" ? 320 : 160)
        ) {
          g.dashPhase = "";
          g.dashing = false;
          g.state = "idle";
          g.animT = 0;
        }
        // Block/parry is a short hold, then back to idle.
        if (g.state === "block" && now - g.stateT > 260) {
          g.state = "idle";
          g.stateT = now;
          g.animT = 0;
        }
      }

      g.shX = g.shT > 0 ? (Math.random() - 0.5) * g.shT * 2.5 : g.shX * 0.8;

      cctx.save();
      cctx.translate(Math.round(g.shX), 0);
      drawBg(w, h, g);
      drawBoxes(g);
      drawChar(g);
      drawFX(g);
      drawComboPopup(g);
      cctx.restore();

      raf.current = requestAnimationFrame(frame);
    }

    raf.current = requestAnimationFrame(frame);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf.current);
    };
  }, [duniaId, cfg]);

  const barColor =
    hud.progress > 60 ? "#4ade80" : hud.progress > 20 ? "#fbbf24" : "#ff4444";
  const timerStr = `${String(Math.floor(hud.timeLeft / 60)).padStart(2, "0")}:${String(hud.timeLeft % 60).padStart(2, "0")}`;

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-screen overflow-hidden bg-black select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute top-0 left-0 right-0 p-2 flex justify-between pointer-events-none z-10">
        <div
          className="bg-black/60 px-3 py-2 rounded border border-green-500/30 text-[11px]"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          <div className="grid grid-cols-2 gap-x-3 gap-y-0">
            <span className="text-green-400">SKOR</span>
            <span className="text-white text-right">
              {hud.score.toLocaleString()}
            </span>
            <span className="text-yellow-400">COMBO</span>
            <span className="text-white text-right">
              {hud.combo > 0 ? hud.combo : "-"}
            </span>
            <span className="text-purple-400">KILLS</span>
            <span className="text-white text-right">{hud.kills}</span>
            <span className="text-red-400">NYAWA</span>
            <span className="text-right" style={{ color: hud.hp > 2 ? "#ff6b6b" : hud.hp > 0 ? "#ffaa00" : "#ff2222" }}>
              {hud.hp}/{hud.maxHp}
            </span>
            <span className="text-pink-400">MISS</span>
            <span className="text-white text-right">{hud.missed}</span>
            <span className="text-blue-400 ml-2">WAVE</span>
            <span className="text-white text-right">{hud.wave}</span>
          </div>
        </div>
        <div
          className="bg-black/60 px-3 py-2 rounded border border-green-500/30 text-center"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          <div
            className="text-lg font-bold"
            style={{ color: hud.started ? barColor : "#fbbf24" }}
          >
            {hud.started ? timerStr : "KETIK PERTAMA!"}
          </div>
        </div>
        <div
          className="bg-black/60 px-3 py-2 rounded border border-green-500/30 text-center text-[10px]"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          <div className="text-gray-400">
            {duniaNama}{" "}
            <span
              style={{
                color:
                  difficulty === "EASY"
                    ? "#4ade80"
                    : difficulty === "MEDIUM"
                      ? "#fbbf24"
                      : "#ff4444",
              }}
            >
              {difficulty}
            </span>
          </div>
          <div className="flex gap-2 mt-0.5">
            <span className="text-gray-500">WPM</span>
            <span className="text-green-400">{hud.wpm}</span>
            <span className="text-gray-500">AKR</span>
            <span className="text-blue-400">{hud.acc}%</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="h-2 bg-gray-800">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${hud.progress}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div
          className="bg-black/70 px-4 py-1 rounded border border-green-500/40 text-center text-green-400 text-xs"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          {hud.started ? "Ketik huruf → tebas!" : "Ketik huruf untuk mulai!"}
        </div>
      </div>
      {hud.over && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="bg-gray-900 border-2 border-green-500 px-8 py-6 rounded text-center">
            <div
              className="text-3xl font-bold mb-3"
              style={{
                fontFamily: '"Press Start 2P", monospace',
                color: hud.hp <= 0 ? "#ff4444" : "#4ade80",
              }}
            >
              {hud.hp <= 0 ? "GAME OVER!" : "TIME'S UP!"}
            </div>
            <div
              className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs mb-4"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              <span className="text-gray-400 text-left">SKOR</span>
              <span className="text-green-400 text-right">
                {hud.score.toLocaleString()}
              </span>
              <span className="text-gray-400 text-left">WPM</span>
              <span className="text-green-400 text-right">{hud.wpm}</span>
              <span className="text-gray-400 text-left">AKURASI</span>
              <span className="text-blue-400 text-right">{hud.acc}%</span>
              <span className="text-gray-400 text-left">COMBO</span>
              <span className="text-yellow-400 text-right">{hud.maxCombo}</span>
              <span className="text-gray-400 text-left">KILLS</span>
              <span className="text-purple-400 text-right">{hud.kills}</span>
              <span className="text-gray-400 text-left">MISS</span>
              <span className="text-red-400 text-right">{hud.missed}</span>
            </div>
            <p
              className="text-gray-500 text-xs"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              Menghitung hasil...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
