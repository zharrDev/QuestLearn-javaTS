let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', vol = 0.12) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

function playNoise(duration: number, vol = 0.08) {
  try {
    const ctx = getCtx()
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    const src = ctx.createBufferSource()
    const gain = ctx.createGain()
    src.buffer = buffer
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    src.connect(gain)
    gain.connect(ctx.destination)
    src.start(ctx.currentTime)
  } catch {}
}

export const SFX = {
  jump() {
    playTone(300, 0.1, 'square', 0.1)
    setTimeout(() => playTone(500, 0.08, 'square', 0.08), 30)
  },
  coin() {
    playTone(988, 0.08, 'square', 0.1)
    setTimeout(() => playTone(1319, 0.12, 'square', 0.08), 60)
  },
  attack() {
    playNoise(0.08, 0.12)
    playTone(200, 0.06, 'sawtooth', 0.1)
  },
  hit() {
    playTone(200, 0.15, 'sawtooth', 0.12)
    playNoise(0.1, 0.1)
  },
  stomp() {
    playTone(400, 0.06, 'square', 0.1)
    setTimeout(() => playTone(600, 0.1, 'square', 0.08), 40)
  },
  hurt() {
    playTone(150, 0.2, 'sawtooth', 0.12)
    setTimeout(() => playTone(100, 0.15, 'sawtooth', 0.1), 80)
  },
  death() {
    for (let i = 0; i < 5; i++) setTimeout(() => playTone(300 - i * 40, 0.15, 'sawtooth', 0.1), i * 100)
  },
  heal() {
    playTone(523, 0.1, 'sine', 0.1)
    setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 80)
    setTimeout(() => playTone(784, 0.15, 'sine', 0.08), 160)
  },
  door() {
    playTone(440, 0.1, 'square', 0.08)
    setTimeout(() => playTone(554, 0.1, 'square', 0.08), 100)
    setTimeout(() => playTone(659, 0.15, 'square', 0.06), 200)
  },
  checkpoint() {
    playTone(660, 0.08, 'sine', 0.1)
    setTimeout(() => playTone(880, 0.12, 'sine', 0.08), 70)
  },
}
