import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = 'http://localhost:5173'
const API = 'http://localhost:8080/api'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const shotsDir = path.join(process.env.TEMP || '.', 'ql-ui-shots')
fs.mkdirSync(shotsDir, { recursive: true })

const report = { steps: [], errors: [], shots: [] }
function step(name, ok, detail) {
  report.steps.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + JSON.stringify(detail) : ''}`)
}

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url)
    this.id = 0
    this.pending = new Map()
    this.logs = []
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const p = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) p.reject(new Error(JSON.stringify(msg.error)))
        else p.resolve(msg.result)
      } else if (msg.method) {
        this.logs.push(msg)
      }
    }
  }
  open() {
    return new Promise((res, rej) => {
      this.ws.onopen = () => res()
      this.ws.onerror = () => rej(new Error('websocket failed'))
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }))
  }
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails.text))
    return r.result?.value
  }
  async waitFor(expression, timeout = 15000, label = expression) {
    const t0 = Date.now()
    while (Date.now() - t0 < timeout) {
      try {
        if (await this.eval(expression)) return true
      } catch {
        /* page still navigating */
      }
      await sleep(150)
    }
    throw new Error('timeout waiting for ' + label)
  }
  async click(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'none' })
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 })
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 })
  }
  async typeChar(ch) {
    // insertText goes through the hidden input, which is what phones use.
    await this.send('Input.insertText', { text: ch })
  }
  async shot(name) {
    const r = await this.send('Page.captureScreenshot', { format: 'png' })
    const file = path.join(shotsDir, `${name}.png`)
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'))
    report.shots.push(file)
    return file
  }
}

async function registerUser() {
  const email = `ui${Date.now()}@questlearn.test`
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama: 'Canvas Tester', email, password: 'test1234', confirmPassword: 'test1234' }),
  })
  if (!res.ok) throw new Error('register failed ' + res.status + ' ' + (await res.text()))
  const json = await res.json()
  return json.data
}

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + path.join(process.env.TEMP || '.', 'ql-ui-chrome-profile'),
    '--window-size=1440,900',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

let cdp
try {
  let version
  for (let i = 0; i < 40; i++) {
    try {
      version = await (await fetch('http://127.0.0.1:9222/json/version')).json()
      break
    } catch {
      await sleep(250)
    }
  }
  if (!version) throw new Error('Chrome devtools never became ready')

  const target = await (await fetch('http://127.0.0.1:9222/json/new?' + encodeURIComponent(BASE + '/login'), { method: 'PUT' })).json()
  cdp = new CDP(target.webSocketDebuggerUrl)
  await cdp.open()

  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Log.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })

  // Log in by seeding the token the app already knows how to read.
  const auth = await registerUser()
  await cdp.waitFor('document.readyState === "complete"', 20000, 'login page')
  await cdp.eval(
    `localStorage.setItem('questlearn_token', ${JSON.stringify(auth.token)});
     localStorage.setItem('questlearn_user', ${JSON.stringify(
       JSON.stringify({
         id: auth.id,
         email: auth.email,
         nama: auth.nama,
         role: auth.role,
         totalXp: auth.totalXp ?? 0,
         currentStreak: auth.currentStreak ?? 0,
       }),
     )});
     true`,
  )
  await cdp.send('Page.navigate', { url: BASE + '/typing' })
  await cdp.waitFor('document.body.innerText.includes("TYPING STRIKE")', 20000, 'world select page')

  const worldCards = await cdp.eval('document.querySelectorAll("button[aria-pressed]").length')
  step('world selector rendered', worldCards >= 6, { worldCards })

  // Pick "Bahasa Indonesia" so the run also covers non-ASCII layout.
  const clickedWorld = await cdp.eval(`(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.innerText.includes('Bahasa Indonesia'));
    if (!b) return false; b.click(); return true;
  })()`)
  step('indonesian world selected', clickedWorld === true, null)

  await cdp.waitFor(
    `[...document.querySelectorAll('button')].some((x) => /START RUN|MULAI/.test(x.innerText) && !x.disabled)`,
    15000,
    'enabled start button',
  )
  const started = await cdp.eval(`(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /START RUN|MULAI/.test(x.innerText) && !x.disabled);
    if (!b) return false; b.click(); return true;
  })()`)
  step('start session from select page', started === true, null)

  await cdp.waitFor('window.__typingGame && window.__typingGame().phase === "ready"', 20000, 'arena ready')
  await sleep(700)
  await cdp.shot('desktop-ready')

  const dom = await cdp.eval(`(() => {
    const c = document.querySelector('canvas');
    const wrap = c.parentElement;
    return { kids: [...wrap.children].map((n) => n.tagName), buttons: wrap.querySelectorAll('button').length, rect: wrap.getBoundingClientRect().toJSON() };
  })()`)
  step('arena has no HTML UI (canvas + hidden input only)', dom.kids.length === 2 && dom.buttons === 0, dom)

  const state0 = await cdp.eval('window.__typingGame()')
  step('ready overlay exposes START hit box', !!state0.ui?.find((b) => b.action === 'start'), state0.ui)

  // Canvas actually contains the painted pixel UI.
  const pixels = await cdp.eval(`(() => {
    const c = document.querySelector('canvas');
    const ctx = c.getContext('2d');
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const colors = new Set(); let bright = 0; let samples = 0;
    for (let i = 0; i < d.length; i += 4000) {
      colors.add(d[i] + ',' + d[i+1] + ',' + d[i+2]);
      if (d[i] + d[i+1] + d[i+2] > 60) bright++;
      samples++;
    }
    return { colors: colors.size, bright, samples };
  })()`)
  step('canvas painted with pixel art (many colours, non-empty)', pixels.colors > 40 && pixels.bright / pixels.samples > 0.2, pixels)

  // Click the canvas-painted START button.
  const startBox = state0.ui.find((b) => b.action === 'start')
  const ox = dom.rect.left
  const oy = dom.rect.top
  await cdp.click(ox + startBox.x + startBox.w / 2, oy + startBox.y + startBox.h / 2)
  await cdp.waitFor('window.__typingGame().phase === "playing"', 8000, 'countdown to gameplay')
  step('canvas START button starts the run', true, null)

  // Type the live target words through the hidden input.
  let typedWords = 0
  for (let round = 0; round < 14; round++) {
    const target = await cdp.eval('window.__typingGame().nextTarget')
    if (!target || !target.word) {
      await sleep(200)
      continue
    }
    for (const ch of target.word) {
      await cdp.typeChar(ch)
      await sleep(35)
    }
    typedWords++
    const st = await cdp.eval('window.__typingGame()')
    if (st.hp <= 0) break
  }
  await sleep(400)
  const afterTyping = await cdp.eval('window.__typingGame()')
  step('typing clears crates and scores', afterTyping.kills > 0 && afterTyping.score > 0, {
    typedWords,
    kills: afterTyping.kills,
    score: afterTyping.score,
    hp: afterTyping.hp,
    accuracy: afterTyping.accuracy,
    phase: afterTyping.phase,
  })
  await cdp.shot('desktop-playing')

  // Pause / resume through the painted sky-blue control buttons.
  const playing = await cdp.eval('window.__typingGame()')
  const pauseBox = playing.ui.find((b) => b.action === 'pause')
  await cdp.click(ox + pauseBox.x + pauseBox.w / 2, oy + pauseBox.y + pauseBox.h / 2)
  await sleep(400)
  const paused = await cdp.eval('window.__typingGame().phase')
  step('painted pause button pauses', paused === 'paused', { paused })
  await cdp.shot('desktop-paused')

  const pausedState = await cdp.eval('window.__typingGame()')
  const resumeBox = pausedState.ui.find((b) => b.action === 'resume')
  step('pause overlay exposes RESUME/RESTART hit boxes', !!resumeBox && !!pausedState.ui.find((b) => b.action === 'restart'), pausedState.ui)
  await cdp.click(ox + resumeBox.x + resumeBox.w / 2, oy + resumeBox.y + resumeBox.h / 2)
  await sleep(300)
  step('painted RESUME button resumes', (await cdp.eval('window.__typingGame().phase')) === 'playing', null)

  // Mute toggle paints itself and persists.
  const live = await cdp.eval('window.__typingGame()')
  const muteBox = live.ui.find((b) => b.action === 'mute')
  await cdp.click(ox + muteBox.x + muteBox.w / 2, oy + muteBox.y + muteBox.h / 2)
  await sleep(250)
  step('painted mute button toggles sound', (await cdp.eval(`localStorage.getItem('questlearn.muted')`)) === '1', null)

  // Short 30-second run: verifies the canvas game-over overlay and the hand-off
  // to the result page.
  await cdp.send('Page.navigate', { url: BASE + '/typing' })
  await cdp.waitFor('document.body.innerText.includes("TYPING STRIKE")', 20000, 'select page for short run')
  await cdp.waitFor(
    `[...document.querySelectorAll('button')].some((x) => /START RUN|MULAI/.test(x.innerText) && !x.disabled)`,
    15000,
    'short run start button',
  )
  await cdp.eval(`(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /30 detik|30 sec/.test(x.innerText));
    if (b) b.click();
    const s = [...document.querySelectorAll('button')].find((x) => /START RUN|MULAI/.test(x.innerText) && !x.disabled);
    if (s) s.click(); return true;
  })()`)
  await cdp.waitFor('window.__typingGame && window.__typingGame().phase === "ready"', 20000, 'short run arena')
  const shortState = await cdp.eval('window.__typingGame()')
  const shortRect = await cdp.eval('document.querySelector("canvas").parentElement.getBoundingClientRect().toJSON()')
  const shortStart = shortState.ui.find((b) => b.action === 'start')
  await cdp.click(shortRect.left + shortStart.x + shortStart.w / 2, shortRect.top + shortStart.y + shortStart.h / 2)
  await cdp.waitFor('window.__typingGame().phase === "over"', 45000, 'run timer expiry')
  await sleep(200)
  const overState = await cdp.eval('window.__typingGame()')
  await cdp.shot('desktop-gameover')
  step('canvas game-over overlay shown', overState.phase === 'over' && overState.score >= 0, {
    phase: overState.phase,
    hp: overState.hp,
    missed: overState.missed,
  })
  await cdp.waitFor('location.pathname === "/typing/result"', 20000, 'result page navigation')
  step('session submitted and result page reached', true, null)

  // Mobile layout: same flow at phone metrics.
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  })
  await cdp.send('Page.navigate', { url: BASE + '/typing' })
  await cdp.waitFor('document.body.innerText.includes("TYPING STRIKE")', 20000, 'mobile world select')
  await sleep(500)
  await cdp.waitFor(
    `[...document.querySelectorAll('button')].some((x) => /START RUN|MULAI/.test(x.innerText) && !x.disabled)`,
    15000,
    'enabled mobile start button',
  )
  await cdp.eval(`(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /START RUN|MULAI/.test(x.innerText) && !x.disabled);
    if (b) b.click(); return !!b;
  })()`)
  await cdp.waitFor('window.__typingGame && window.__typingGame().phase === "ready"', 20000, 'mobile arena ready')
  await sleep(600)
  const mobile = await cdp.eval('window.__typingGame()')
  const mobileDom = await cdp.eval(`(() => { const c = document.querySelector('canvas'); return { w: c.clientWidth, h: c.clientHeight, kids: [...c.parentElement.children].map(n => n.tagName) } })()`)
  step('mobile arena is canvas-only and sized to viewport', mobileDom.w === 390 && mobileDom.kids.length === 2, mobileDom)
  const mStart = mobile.ui.find((b) => b.action === 'start')
  const fits = mStart && mStart.x >= 0 && mStart.x + mStart.w <= mobile.viewW && mStart.y >= 0 && mStart.y + mStart.h <= mobile.viewH
  step('mobile START button fits on screen', !!fits, { start: mStart, view: [mobile.viewW, mobile.viewH] })
  await cdp.shot('mobile-ready')

  const mobileRect = await cdp.eval('document.querySelector("canvas").parentElement.getBoundingClientRect().toJSON()')
  await cdp.click(mobileRect.left + mStart.x + mStart.w / 2, mobileRect.top + mStart.y + mStart.h / 2)
  await cdp.waitFor('window.__typingGame().phase === "playing"', 8000, 'mobile gameplay')
  await sleep(500)
  await cdp.shot('mobile-playing')
  step('mobile canvas START works', true, null)

  const errs = cdp.logs
    .filter(
      (m) =>
        m.method === 'Runtime.exceptionThrown' ||
        (m.method === 'Runtime.consoleAPICalled' && m.params?.type === 'error') ||
        (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error'),
    )
    .map((m) => m.params?.entry?.text || m.params?.exceptionDetails?.exception?.description || m.params?.args?.map((a) => a.value ?? a.description).join(' '))
  report.errors = errs
  step('no console errors during run', errs.length === 0, errs.slice(0, 5))

  const failed = report.steps.filter((s) => !s.ok)
  console.log('\nSUMMARY ' + JSON.stringify({ passed: report.steps.length - failed.length, failed: failed.length, shots: report.shots, errors: report.errors }, null, 2))
  process.exitCode = failed.length === 0 ? 0 : 1
} catch (err) {
  console.error('TEST ERROR', err.message)
  console.log('SHOTS', report.shots)
  if (report.steps.length) console.log(JSON.stringify(report.steps, null, 2))
  process.exitCode = 1
} finally {
  try {
    cdp?.ws.close()
  } catch {
    /* ignore */
  }
  try {
    process.kill(chrome.pid)
  } catch {
    /* ignore */
  }
}
