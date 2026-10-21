/**
 * Tiny procedural sound engine. Every sound is synthesized with WebAudio, so
 * the game ships without a single audio asset and works offline.
 */
class SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  muted = false

  constructor() {
    try {
      this.muted = window.localStorage.getItem('questlearn.muted') === '1'
    } catch {
      this.muted = false
    }
  }

  /** Must be called from a user gesture (click / key) on some browsers. */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return
    }
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    this.ctx = new Ctor()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.16
    this.master.connect(this.ctx.destination)
  }

  setMuted(muted: boolean) {
    this.muted = muted
    try {
      window.localStorage.setItem('questlearn.muted', muted ? '1' : '0')
    } catch {
      // ignore
    }
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.16, this.ctx.currentTime, 0.02)
    }
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType,
    gain = 0.5,
    endFreq?: number,
    delay = 0,
  ) {
    if (this.muted) return
    this.unlock()
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    const t0 = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + duration)
    env.gain.setValueAtTime(0.0001, t0)
    env.gain.exponentialRampToValueAtTime(gain, t0 + 0.008)
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
    osc.connect(env)
    env.connect(master)
    osc.start(t0)
    osc.stop(t0 + duration + 0.03)
  }

  private noise(duration: number, gain = 0.35, filterFreq = 2400) {
    if (this.muted) return
    this.unlock()
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    const frames = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = filterFreq
    const env = ctx.createGain()
    env.gain.value = gain
    src.connect(filter)
    filter.connect(env)
    env.connect(master)
    src.start()
  }

  slash(step = 0) {
    this.noise(0.06, 0.28, 1800)
    this.tone(520 + step * 26, 0.07, 'triangle', 0.18, 300)
  }

  kill() {
    this.tone(660, 0.09, 'square', 0.16)
    this.tone(880, 0.1, 'square', 0.14, undefined, 0.06)
    this.tone(1320, 0.14, 'square', 0.1, undefined, 0.12)
  }

  error() {
    this.tone(180, 0.11, 'sawtooth', 0.2, 110)
  }

  miss() {
    this.tone(220, 0.28, 'sawtooth', 0.24, 80)
  }

  countdown(final = false) {
    this.tone(final ? 880 : 440, final ? 0.24 : 0.12, 'square', 0.16)
  }

  ui() {
    this.tone(620, 0.05, 'square', 0.1)
  }
}

export const sfx = new SoundEngine()
