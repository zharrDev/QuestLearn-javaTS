import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants'
import { SFX } from '../audio'

const W = GAME_WIDTH
const H = GAME_HEIGHT
const GROUND_Y = 440
const PW = 24
const PH = 36
const WORLD_W = 3800
const DOOR_PROX = 56
const ATK_DUR = 14
const ATK_CD = 20
const ATK_RANGE = 42
const ATK_DMG = 22
const STOMP_DMG = 28
const CONTACT_DMG = 12
const SPIKE_DMG = 15

const WORLD_PALETTES: Record<string, {
  skyTop: string; skyBot: string; hillFar: string; hillMid: string; hillNear: string;
  groundTop: string; groundMid: string; groundBot: string;
  platTop: string; platBody: string; platEdge: string;
  accent: number; doorFrame: number;
}> = {
  english: {
    skyTop: '#87CEEB', skyBot: '#E8F4FD', hillFar: '#8BB07A', hillMid: '#7A9B6B', hillNear: '#6B8C5B',
    groundTop: '#7A9B6B', groundMid: '#6B8C5B', groundBot: '#5A7B4A',
    platTop: '#BFA07A', platBody: '#A67C52', platEdge: '#8B6A4A',
    accent: 0xD97757, doorFrame: 0x8B5E3C,
  },
  math: {
    skyTop: '#F0D9A0', skyBot: '#F5ECD5', hillFar: '#D4C090', hillMid: '#C9A46A', hillNear: '#B89355',
    groundTop: '#C9A46A', groundMid: '#B89355', groundBot: '#A78240',
    platTop: '#E2D0B8', platBody: '#D6BFA0', platEdge: '#C2A880',
    accent: 0x2C5F5D, doorFrame: 0x7A6A50,
  },
  logic: {
    skyTop: '#3A4A6B', skyBot: '#6B7FA0', hillFar: '#4A6A4A', hillMid: '#3A5A3A', hillNear: '#2A4A2A',
    groundTop: '#5A7B5A', groundMid: '#4A6B4A', groundBot: '#3A5B3A',
    platTop: '#7A9A7A', platBody: '#6B8A6B', platEdge: '#5A7A5A',
    accent: 0xE8A93B, doorFrame: 0x5A4A3A,
  },
}

const ENEMY_COLORS: Record<string, number> = {
  slime: 0x55CC55, ghost: 0xAAAADD, skeleton: 0xDDDDCC, spider: 0x664422, ogre: 0x886644,
}

function hex(h: string) { return parseInt(h.replace('#', ''), 16) }

function getWorldData(duniaId: number) {
  const platforms = [
    { x: 0, y: GROUND_Y, w: 440, h: 120 }, { x: 520, y: GROUND_Y, w: 360, h: 120 },
    { x: 960, y: GROUND_Y, w: 320, h: 120 }, { x: 1360, y: GROUND_Y, w: 280, h: 120 },
    { x: 1720, y: GROUND_Y, w: 400, h: 120 }, { x: 2200, y: GROUND_Y, w: 340, h: 120 },
    { x: 2620, y: GROUND_Y, w: 380, h: 120 }, { x: 3080, y: GROUND_Y, w: 320, h: 120 },
    { x: 3480, y: GROUND_Y, w: 320, h: 120 },
    { x: 200, y: 360, w: 120, h: 16 }, { x: 460, y: 330, w: 100, h: 16 },
    { x: 680, y: 370, w: 110, h: 16 }, { x: 880, y: 310, w: 130, h: 16 },
    { x: 1100, y: 350, w: 100, h: 16 }, { x: 1340, y: 300, w: 120, h: 16 },
    { x: 1560, y: 360, w: 110, h: 16 }, { x: 1800, y: 310, w: 130, h: 16 },
    { x: 2050, y: 360, w: 100, h: 16 }, { x: 2280, y: 300, w: 120, h: 16 },
    { x: 2500, y: 350, w: 110, h: 16 }, { x: 2720, y: 290, w: 130, h: 16 },
    { x: 2960, y: 340, w: 110, h: 16 }, { x: 3200, y: 300, w: 120, h: 16 },
    { x: 3440, y: 350, w: 100, h: 16 },
  ]
  const gapPos = [440, 880, 1280, 1640, 2120, 2540, 3000, 3400]
  const spikes: { x: number; y: number }[] = []
  for (const gx of gapPos) for (let j = 0; j < 3; j++) spikes.push({ x: gx + j * 26, y: GROUND_Y - 2 })
  const checkpoints = [{ x: 180, y: GROUND_Y }, { x: 1400, y: GROUND_Y }, { x: 2680, y: GROUND_Y }]

  const npcDefs = duniaId === 1
    ? [{ x: 300, type: 'teacher' as const, name: 'Bu Guru Siti' }, { x: 800, type: 'elder' as const, name: 'Pak Pustaka' }]
    : duniaId === 2
    ? [{ x: 300, type: 'sage' as const, name: 'Prof. Aljabar' }, { x: 800, type: 'sage' as const, name: 'Penyihir Hitung' }]
    : [{ x: 300, type: 'fairy' as const, name: 'Peri Logika' }, { x: 800, type: 'owl' as const, name: 'Burung Hantu Bijak' }]

  const enemyDefs = duniaId === 1
    ? [{ x: 620, pR: 820, type: 'slime' as const, name: 'Monster Typo', hp: 40, spd: 60 },
       { x: 1050, pR: 1200, type: 'ghost' as const, name: 'Hantu Grammar', hp: 50, spd: 50 },
       { x: 1800, pR: 2000, type: 'skeleton' as const, name: 'Tulang Fonetik', hp: 60, spd: 70 },
       { x: 2700, pR: 2900, type: 'spider' as const, name: 'Laba Huruf', hp: 45, spd: 80 }]
    : duniaId === 2
    ? [{ x: 620, pR: 800, type: 'skeleton' as const, name: 'Kalajengking Angka', hp: 45, spd: 65 },
       { x: 1100, pR: 1240, type: 'spider' as const, name: 'Bug Hitungan', hp: 55, spd: 75 },
       { x: 1820, pR: 2020, type: 'ogre' as const, name: 'Ogre Aljabar', hp: 70, spd: 40 },
       { x: 2700, pR: 2900, type: 'slime' as const, name: 'Lendir Desimal', hp: 40, spd: 70 }]
    : [{ x: 620, pR: 800, type: 'ghost' as const, name: 'Zombie Bingung', hp: 50, spd: 55 },
       { x: 1100, pR: 1250, type: 'skeleton' as const, name: 'Rangka Deduksi', hp: 60, spd: 65 },
       { x: 1820, pR: 2020, type: 'ogre' as const, name: 'Ogre Teka-teki', hp: 80, spd: 35 },
       { x: 2700, pR: 2900, type: 'spider' as const, name: 'Labalaba Logika', hp: 50, spd: 85 }]

  return { platforms, spikes, checkpoints, npcDefs, enemyDefs }
}

export interface PlatformerCallbacks {
  onLevelEnter: (l: { id: number; nama: string; status: string; isBoss: boolean; xpReward: number }) => void
  onLevelGate: (l: { id: number; nama: string; status: string; isBoss: boolean; xpReward: number }) => boolean
  onGameOver: () => void
  onCoinCollect: (n: number) => void
  onHpChange: (hp: number, max: number) => void
}

export class PlatformerScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private pDir = 1; private pFrame = 0; private pHp = 50; private pMaxHp = 50; private pCoins = 0
  private pInv = 0; private pDmgFlash = 0; private pAtkTimer = 0; private pAtkCd = 0; private pAtkHit = false
  private pGrounded = false; private pCoyote = 0; private pJumpBuf = 0; private pJumpHeld = false
  private cpX = 100; private cpY = GROUND_Y - PH

  private platGroup!: Phaser.Physics.Arcade.StaticGroup
  private bgGfx!: Phaser.GameObjects.Graphics
  private groundGfx!: Phaser.GameObjects.Graphics
  private spikeGfx!: Phaser.GameObjects.Graphics
  private attackGfx!: Phaser.GameObjects.Graphics
  private cpGfx!: Phaser.GameObjects.Graphics
  private particleGfx!: Phaser.GameObjects.Graphics

  private enemySprites: Phaser.GameObjects.Container[] = []
  private enemyHpBars: Phaser.GameObjects.Graphics[] = []
  private eData: { x: number; y: number; w: number; h: number; name: string; hp: number; maxHp: number;
    pL: number; pR: number; spd: number; dir: number; idle: number; type: string; flash: number; vx: number }[] = []

  private coinSprites: Phaser.GameObjects.Sprite[] = []
  private cData: { x: number; y: number; collected: boolean; bob: number }[] = []

  private heartSprites: Phaser.GameObjects.Container[] = []
  private hData: { x: number; y: number; collected: boolean; bob: number; timer: number; sprite: Phaser.GameObjects.Container }[] = []

  private cpData: { x: number; y: number; activated: boolean }[] = []
  private doorData: { x: number; level: { id: number; nama: string; status: string; isBoss: boolean; xpReward: number } }[] = []
  private nearbyDoor: { x: number; level: { id: number; nama: string; status: string; isBoss: boolean; xpReward: number } } | null = null
  private doorSprites: Phaser.GameObjects.Container[] = []
  private npcSprites: Phaser.GameObjects.Container[] = []

  private particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: number; size: number }[] = []
  private dmgNums: { x: number; y: number; text: string; life: number; color: number; txt: Phaser.GameObjects.Text }[] = []

  private camX = 0; private camShakeI = 0
  private duniaId = 1; private themeKey = 'english'
  private levels: { id: number; nama: string; status: string; isBoss: boolean; xpReward: number }[] = []
  private gameRunning = true; private frame = 0
  private callbacks: PlatformerCallbacks | null = null
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>
  private attackKey!: Phaser.Input.Keyboard.Key
  private bgLayer!: Phaser.GameObjects.Graphics
  private fgLayer!: Phaser.GameObjects.Graphics

  constructor() { super({ key: 'PlatformerScene' }) }

  init(data: {
    duniaId: number; levels: { id: number; nama: string; status: string; isBoss: boolean; xpReward: number }[]
    theme: string; playerAvatar: string; playerHp?: number; playerMaxHp?: number; playerCoins?: number
    callbacks?: PlatformerCallbacks
  }) {
    this.duniaId = data.duniaId
    this.levels = data.levels
    this.themeKey = data.theme
    this.pHp = data.playerHp ?? 50; this.pMaxHp = data.playerMaxHp ?? 50; this.pCoins = data.playerCoins ?? 0
    this.callbacks = data.callbacks || null
    this.gameRunning = true; this.frame = 0; this.camX = 0; this.camShakeI = 0
    this.particles = []; this.dmgNums = []; this.nearbyDoor = null
    this.enemySprites = []; this.coinSprites = []; this.heartSprites = []; this.doorSprites = []; this.npcSprites = []
    this.cpX = 100; this.cpY = GROUND_Y - PH
    this.eData = []; this.cData = []; this.hData = []; this.cpData = []; this.doorData = []
  }

  create() {
    this.keys = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      W: this.input.keyboard!.addKey('W'), A: this.input.keyboard!.addKey('A'),
      D: this.input.keyboard!.addKey('D'), E: this.input.keyboard!.addKey('E'),
      J: this.input.keyboard!.addKey('J'), X: this.input.keyboard!.addKey('X'),
    }
    this.attackKey = this.input.keyboard!.addKey('ENTER')

    this.generateTextures()

    this.bgLayer = this.add.graphics().setDepth(0)
    this.groundGfx = this.add.graphics().setDepth(1)
    this.spikeGfx = this.add.graphics().setDepth(2)
    this.cpGfx = this.add.graphics().setDepth(3)
    this.attackGfx = this.add.graphics().setDepth(8)
    this.particleGfx = this.add.graphics().setDepth(9)
    this.bgGfx = this.add.graphics().setDepth(0)

    const world = getWorldData(this.duniaId)
    const pal = WORLD_PALETTES[this.themeKey] || WORLD_PALETTES.english

    this.platGroup = this.physics.add.staticGroup()
    for (const p of world.platforms) {
      const key = p.h > 30 ? `ground_${this.themeKey}` : `plat_${this.themeKey}`
      const s = this.add.sprite(p.x + p.w / 2, p.y + p.h / 2, key).setDisplaySize(p.w, p.h)
      this.platGroup.add(s)
      ;(s.body as Phaser.Physics.Arcade.Body).setSize(p.w, p.h).setOffset(-p.w / 2, -p.h / 2)
    }

    this.player = this.physics.add.sprite(100, GROUND_Y - PH, 'player_sheet', 0)
    const pb = this.player.body as Phaser.Physics.Arcade.Body
    pb.setSize(PW, PH).setAllowGravity(false).setVelocity(0, 0)
    this.player.setDepth(5).setCollideWorldBounds(false)
    this.physics.add.collider(this.player, this.platGroup)

    this.cpData = world.checkpoints.map(c => ({ ...c, activated: false }))
    this.doorData = this.levels.map((l, i) => ({ x: 200 + i * 560, level: l }))
    this.eData = world.enemyDefs.map(e => ({
      x: e.x, y: GROUND_Y - 32, w: 28, h: 32, name: e.name, hp: e.hp, maxHp: e.hp,
      pL: e.x - 80, pR: e.pR, spd: e.spd, dir: 1, idle: 0, type: e.type, flash: 0, vx: 0,
    }))
    for (let i = 0; i < 40; i++) this.cData.push({
      x: 100 + Math.random() * (WORLD_W - 200), y: GROUND_Y - 50 - Math.random() * 120,
      collected: false, bob: Math.random() * Math.PI * 2,
    })

    this.createCoins()
    this.createEnemies()
    this.createDoors()
    this.createNPCs()

    this.input.keyboard!.on('keydown-E', () => { if (this.gameRunning) this.handleInteract() })
    this.input.keyboard!.on('keydown-ENTER', () => { if (this.gameRunning) this.handleInteract() })
    this.input.on('pointerdown', () => { if (this.gameRunning && this.nearbyDoor) this.handleInteract() })

    this.scene.launch('HUDScene', { themeKey: this.themeKey, levels: this.levels })
  }

  private generateTextures() {
    const pal = WORLD_PALETTES[this.themeKey] || WORLD_PALETTES.english

    if (!this.textures.exists('player_sheet')) {
      const g = this.add.graphics()
      const frames = [
        { ox: 0, legL: [2, PW - 7, 8, 7], legR: [14, PW - 7, 8, 7] },
        { ox: PW, legL: [0, PW - 7, 8, 7], legR: [12, PW - 5, 8, 7] },
        { ox: PW * 2, legL: [4, PW - 5, 8, 7], legR: [16, PW - 7, 8, 7] },
        { ox: PW * 3, legL: [1, PW - 9, 8, 7], legR: [15, PW - 9, 8, 7] },
      ]
      for (const f of frames) {
        const ox = f.ox
        g.fillStyle(0x3A2A1A); g.fillRect(ox + f.legL[0], f.legL[1], f.legL[2], f.legL[3]); g.fillRect(ox + f.legR[0], f.legR[1], f.legR[2], f.legR[3])
        g.fillStyle(0x5D3A9B); g.fillRect(ox + 3, 12, 18, 22); g.fillRect(ox + 1, 28, 22, 6)
        g.fillStyle(0xFFD93D); g.fillRect(ox + 3, 24, 18, 2)
        g.fillStyle(0x3D1A6B); g.fillRect(ox + 4, 0, 16, 14); g.fillRect(ox + 2, 4, 20, 8)
        g.fillStyle(0xFDDCB5); g.fillRect(ox + 6, 5, 12, 8)
        g.fillStyle(0x2A1A0A); g.fillRect(ox + 8, 7, 3, 3); g.fillRect(ox + 14, 7, 3, 3)
        g.fillStyle(0xA67C52); g.fillRect(ox + 20, 6, 2, 26)
        g.fillStyle(0xFFD93D); g.fillRect(ox + 18, 2, 6, 6)
      }
      g.generateTexture('player_sheet', PW * 4, PH); g.destroy()
      if (!this.anims.exists('player_walk')) {
        this.anims.create({ key: 'player_idle', frames: [{ key: 'player_sheet', frame: 0 }], frameRate: 1 })
        this.anims.create({ key: 'player_walk', frames: this.anims.generateFrameNumbers('player_sheet', { start: 0, end: 3 }), frameRate: 8, repeat: -1 })
      }
    }

    const groundKey = `ground_${this.themeKey}`
    if (!this.textures.exists(groundKey)) {
      const g = this.add.graphics()
      g.fillStyle(hex(pal.groundTop)); g.fillRect(0, 0, 4, 4)
      g.fillStyle(hex(pal.groundMid)); g.fillRect(0, 4, 4, 4)
      g.fillStyle(hex(pal.groundBot)); g.fillRect(0, 8, 4, 4)
      g.generateTexture(groundKey, 4, 12); g.destroy()
    }

    const platKey = `plat_${this.themeKey}`
    if (!this.textures.exists(platKey)) {
      const g = this.add.graphics()
      g.fillStyle(hex(pal.platTop)); g.fillRect(0, 0, 4, 1)
      g.fillStyle(hex(pal.platBody)); g.fillRect(0, 1, 4, 2)
      g.fillStyle(hex(pal.platEdge)); g.fillRect(0, 3, 4, 1)
      g.generateTexture(platKey, 4, 4); g.destroy()
    }

    if (!this.textures.exists('coin')) {
      const g = this.add.graphics()
      g.fillStyle(0xFFD93D); g.fillCircle(8, 8, 7)
      g.fillStyle(0xE8A93B); g.fillCircle(8, 8, 4)
      g.fillStyle(0xFFFFFF, 0.5); g.fillRect(5, 5, 2, 2)
      g.generateTexture('coin', 16, 16); g.destroy()
    }

    if (!this.textures.exists('heart')) {
      const g = this.add.graphics()
      g.fillStyle(0xFF4444); g.fillCircle(4, 3, 4); g.fillCircle(11, 3, 4)
      g.fillTriangle(0, 5, 15, 5, 7.5, 13)
      g.fillStyle(0xFF8888); g.fillRect(3, 2, 2, 2)
      g.generateTexture('heart', 16, 14); g.destroy()
    }

    if (!this.textures.exists('spike')) {
      const g = this.add.graphics()
      g.fillStyle(0xAAAAAA); g.fillTriangle(0, 14, 7, 0, 14, 14)
      g.fillStyle(0x888888); g.fillTriangle(2, 12, 7, 2, 12, 12)
      g.generateTexture('spike', 14, 14); g.destroy()
    }

    for (const [type, color] of Object.entries(ENEMY_COLORS)) {
      if (this.textures.exists(`enemy_${type}`)) continue
      const g = this.add.graphics()
      g.fillStyle(color); g.fillRect(2, 0, 24, 28)
      g.fillStyle(0x000000, 0.2); g.fillRect(4, 2, 4, 4); g.fillRect(18, 2, 4, 4)
      g.fillStyle(0xFFFFFF); g.fillRect(6, 6, 4, 4); g.fillRect(14, 6, 4, 4)
      g.fillStyle(0x000000); g.fillRect(7, 7, 2, 2); g.fillRect(15, 7, 2, 2)
      g.generateTexture(`enemy_${type}`, 28, 32); g.destroy()
    }

    for (const [type, color] of [['teacher', 0x5D3A9B], ['sage', 0x2C5F5D], ['fairy', 0xE8A93B], ['owl', 0x8B6A4A]] as [string, number][]) {
      if (this.textures.exists(`npc_${type}`)) continue
      const g = this.add.graphics()
      g.fillStyle(color); g.fillRect(4, 8, 16, 32)
      g.fillStyle(0xFDDCB5); g.fillCircle(12, 4, 8)
      g.fillStyle(0xFFD93D); g.fillRect(2, 0, 20, 4)
      g.generateTexture(`npc_${type}`, 24, 40); g.destroy()
    }

    for (const [name, col] of [['door_open', 0xD97757], ['door_lock', 0x666666], ['door_done', 0x44AA44]] as [string, number][]) {
      if (this.textures.exists(name)) continue
      const g = this.add.graphics()
      g.fillStyle(0x8B5E3C); g.fillRect(0, 0, 32, 48)
      g.fillStyle(col); g.fillRect(4, 4, 24, 40)
      g.fillStyle(0xFFFFFF, 0.8); g.fillRect(22, 18, 3, 3)
      g.generateTexture(name, 32, 48); g.destroy()
    }

    if (!this.textures.exists('particle')) {
      const g = this.add.graphics()
      g.fillStyle(0xFFFFFF); g.fillRect(0, 0, 4, 4)
      g.generateTexture('particle', 4, 4); g.destroy()
    }
  }

  private createCoins() {
    for (const c of this.cData) {
      const s = this.add.sprite(c.x, c.y, 'coin').setDepth(4)
      this.tweens.add({ targets: s, angle: 360, duration: 2000, repeat: -1 })
      this.tweens.add({ targets: s, y: c.y - 4, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      this.coinSprites.push(s)
    }
  }

  private createEnemies() {
    for (const e of this.eData) {
      const sprite = this.add.sprite(e.x + e.w / 2, e.y + e.h / 2, `enemy_${e.type}`).setDepth(5)
      const hpBg = this.add.graphics().setDepth(6)
      const cont = this.add.container(e.x, e.y, [sprite]).setDepth(5)
      sprite.setPosition(e.w / 2, e.h / 2)
      this.enemySprites.push(cont)
      this.enemyHpBars.push(hpBg)
    }
  }

  private createDoors() {
    for (const d of this.doorData) {
      const isLocked = d.level.status === 'LOCKED'
      const isDone = d.level.status === 'COMPLETED'
      const key = isDone ? 'door_done' : isLocked ? 'door_lock' : 'door_open'
      const sprite = this.add.sprite(16, 24, key)
      if (d.level.isBoss) {
        const crown = this.add.graphics()
        crown.fillStyle(0xFFD93D); crown.fillTriangle(16, -8, 8, 0, 24, 0)
        sprite.setPosition(16, 28)
        this.doorSprites.push(this.add.container(d.x, GROUND_Y, [sprite, crown]).setDepth(3))
      } else {
        this.doorSprites.push(this.add.container(d.x, GROUND_Y, [sprite]).setDepth(3))
      }
    }
  }

  private createNPCs() {
    const world = getWorldData(this.duniaId)
    for (const npc of world.npcDefs) {
      const sprite = this.add.sprite(12, 20, `npc_${npc.type}`)
      this.tweens.add({ targets: sprite, y: 18, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      this.npcSprites.push(this.add.container(npc.x, GROUND_Y, [sprite]).setDepth(3))
    }
  }

  update(_t: number, delta: number) {
    if (!this.gameRunning) return
    this.frame++
    this.handleInput()
    this.updatePlayer(delta)
    this.updateEnemies(delta)
    this.updateCoins()
    this.updateHearts()
    this.updateCheckpoints()
    this.updateDoors()
    this.updateCamera()
    this.updateParticles()
    this.drawBG()
    this.drawGround()
    this.drawSpikes()
    this.drawCheckpoints()
    this.drawAttack()
    this.drawParticles()
    this.drawDmgNums()
    this.events.emit('hp-change', this.pHp, this.pMaxHp)
    this.events.emit('coin-collect', this.pCoins)
    if (this.pHp <= 0) { this.gameRunning = false; SFX.death(); this.callbacks?.onGameOver?.() }
  }

  private handleInput() {
    let dx = 0
    if (this.keys.left?.isDown || this.wasd.A.isDown) { dx = -200; this.pDir = -1 }
    if (this.keys.right?.isDown || this.wasd.D.isDown) { dx = 200; this.pDir = 1 }
    const jump = this.keys.up?.isDown || this.keys.space?.isDown || this.wasd.W.isDown
    const atk = Phaser.Input.Keyboard.JustDown(this.attackKey) || Phaser.Input.Keyboard.JustDown(this.wasd.J) || Phaser.Input.Keyboard.JustDown(this.wasd.X)
    const body = this.player.body as Phaser.Physics.Arcade.Body

    if (dx === 0) { body.setVelocityX(body.velocity.x * 0.7); if (Math.abs(body.velocity.x) < 10) body.setVelocityX(0) }
    else body.setVelocityX(dx)

    if (jump && !this.pJumpHeld) this.pJumpBuf = 8
    if (this.pJumpBuf > 0) this.pJumpBuf--
    if (this.pJumpBuf > 0 && this.pGrounded && !this.pJumpHeld) {
      body.setVelocityY(-350); this.pGrounded = false; this.pJumpHeld = true; this.pJumpBuf = 0; this.pCoyote = 0
      this.spawnPart(this.player.x, this.player.y + PH, 4, 0xCCCCCC, 2, 2)
      SFX.jump()
    }
    if (!jump) this.pJumpHeld = false
    if (!jump && body.velocity.y < -100) body.setVelocityY(Math.max(body.velocity.y, -100))

    if (atk && this.pAtkCd <= 0 && this.pAtkTimer <= 0) {
      this.pAtkTimer = ATK_DUR; this.pAtkCd = ATK_DUR + ATK_CD; this.pAtkHit = false
      SFX.attack()
    }
    if (this.pAtkTimer > 0) this.pAtkTimer--
    if (this.pAtkCd > 0) this.pAtkCd--

    if (this.pAtkTimer > 3 && this.pAtkTimer < ATK_DUR - 2 && !this.pAtkHit) {
      const ax = this.pDir > 0 ? this.player.x : this.player.x - ATK_RANGE
      for (let i = 0; i < this.eData.length; i++) {
        const e = this.eData[i]; if (e.hp <= 0) continue
        if (ax < e.x + e.w && ax + ATK_RANGE > e.x && this.player.y < e.y + e.h && this.player.y + PH > e.y) {
          e.hp -= ATK_DMG; e.flash = 8; e.vx = this.pDir * 150; this.pAtkHit = true
          this.camShakeI = Math.max(this.camShakeI, 4)
          this.spawnPart(e.x + e.w / 2, e.y + e.h / 2, 6, 0xFFD93D, 4, 3)
          this.spawnDmg(e.x + e.w / 2, e.y, ATK_DMG.toString(), 0xFFD93D)
          SFX.hit()
          const spr = this.enemySprites[i]; if (spr) { spr.setAlpha(0.3); this.time.delayedCall(100, () => spr?.setAlpha(1)) }
          if (e.hp <= 0) {
            this.pCoins += 5; this.spawnPart(e.x + e.w / 2, e.y + e.h / 2, 12, 0xFF6B6B, 6, 4)
            SFX.coin()
            if (Math.random() < 0.35) this.dropHeart(e.x + e.w / 2, e.y)
          }
          break
        }
      }
    }
  }

  private updatePlayer(delta: number) {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    this.pGrounded = body.blocked.down || body.touching.down
    if (this.pGrounded) this.pCoyote = 7; else if (this.pCoyote > 0) this.pCoyote--
    if (this.pInv > 0) this.pInv--
    if (this.pDmgFlash > 0) this.pDmgFlash--
    this.player.x = Phaser.Math.Clamp(this.player.x, 0, WORLD_W)

    if (this.pDmgFlash > 0 && this.pDmgFlash % 4 < 2) this.player.setAlpha(0.3)
    else if (this.pInv <= 0 || this.pInv % 6 < 3) this.player.setAlpha(1)

    if ((this.pDir < 0) !== this.player.flipX) this.player.setFlipX(this.pDir < 0)

    const isMoving = Math.abs(body.velocity.x) > 20
    if (!this.pGrounded) {
      this.player.setFrame(3)
      if (this.player.anims.isPlaying) this.player.anims.stop()
    } else if (isMoving) {
      if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== 'player_walk') this.player.play('player_walk')
    } else {
      if (this.player.anims.isPlaying) this.player.anims.stop()
      this.player.setFrame(0)
    }

    for (let i = 0; i < this.eData.length; i++) {
      const e = this.eData[i]; if (e.hp <= 0) continue
      if (this.pInv <= 0 && this.player.x + PW > e.x && this.player.x < e.x + e.w && this.player.y + PH > e.y && this.player.y < e.y + e.h) {
        if (body.velocity.y > 0 && this.player.y + PH < e.y + e.h * 0.5) {
          e.hp -= STOMP_DMG; e.flash = 6; body.setVelocityY(-280); this.camShakeI = Math.max(this.camShakeI, 3)
          this.spawnPart(e.x + e.w / 2, e.y, 6, 0xFFD93D, 3, 2)
          this.spawnDmg(e.x + e.w / 2, e.y, STOMP_DMG.toString(), 0x44FF44)
          SFX.stomp()
          if (e.hp <= 0) { this.pCoins += 5; this.spawnPart(e.x + e.w / 2, e.y + e.h / 2, 12, 0xFF6B6B, 6, 4); SFX.coin(); if (Math.random() < 0.35) this.dropHeart(e.x + e.w / 2, e.y) }
        } else {
          this.pHp = Math.max(0, this.pHp - CONTACT_DMG); this.pInv = 60; this.pDmgFlash = 15
          body.setVelocityX(this.player.x < e.x + e.w / 2 ? -180 : 180); body.setVelocityY(-150)
          this.camShakeI = Math.max(this.camShakeI, 5)
          this.spawnPart(this.player.x + PW / 2, this.player.y + PH / 2, 8, 0xFF4444, 5, 3)
          this.spawnDmg(this.player.x + PW / 2, this.player.y, CONTACT_DMG.toString(), 0xFF4444)
          SFX.hurt()
        }
      }
    }

    const world = getWorldData(this.duniaId)
    for (const sp of world.spikes) {
      if (this.pInv <= 0 && this.player.x + PW > sp.x + 4 && this.player.x < sp.x + 20 && this.player.y + PH > sp.y - 14 && this.player.y + PH < sp.y + 8) {
        this.pHp = Math.max(0, this.pHp - SPIKE_DMG); this.pInv = 60; this.pDmgFlash = 15; body.setVelocityY(-220)
        this.camShakeI = Math.max(this.camShakeI, 5)
        this.spawnPart(this.player.x + PW / 2, this.player.y + PH, 8, 0xFF4444, 4, 2)
        this.spawnDmg(this.player.x + PW / 2, this.player.y, SPIKE_DMG.toString(), 0xFF4444)
        SFX.hurt()
      }
    }

    if (this.player.y > H + 100) {
      this.player.x = this.cpX; this.player.y = this.cpY; body.setVelocity(0, 0)
      this.pHp = Math.max(this.pHp - 20, 1); this.pInv = 60
    }
  }

  private updateEnemies(delta: number) {
    for (let i = 0; i < this.eData.length; i++) {
      const e = this.eData[i]; if (e.hp <= 0) continue
      if (e.flash > 0) e.flash--
      if (e.idle > 0) { e.idle--; continue }
      if (Math.abs(e.vx) > 1) {
        e.x += e.vx * (delta / 1000); e.vx *= 0.85
        if (e.x < e.pL) { e.x = e.pL; e.vx = e.spd; e.dir = 1 }
        if (e.x > e.pR) { e.x = e.pR; e.vx = -e.spd; e.dir = -1 }
      } else {
        e.x += e.spd * e.dir * (delta / 1000)
        if (e.x <= e.pL || e.x >= e.pR) { e.dir *= -1; e.idle = 30 + Math.random() * 60 }
      }
      const spr = this.enemySprites[i]
      if (spr) {
        spr.setPosition(e.x + e.w / 2, e.y + e.h / 2)
        spr.setScale(e.dir > 0 ? 1 : -1, 1)
        if (e.flash > 0) spr.setAlpha(0.4); else spr.setAlpha(1)
      }
      const bar = this.enemyHpBars[i]
      if (bar) {
        bar.clear()
        const bx = e.x; const by = e.y - 8
        bar.fillStyle(0x333333); bar.fillRect(bx, by, e.w, 4)
        const pct = e.hp / e.maxHp
        bar.fillStyle(pct > 0.5 ? 0x44FF44 : pct > 0.25 ? 0xFFAA00 : 0xFF4444)
        bar.fillRect(bx, by, e.w * pct, 4)
      }
    }
  }

  private updateCoins() {
    for (let i = 0; i < this.cData.length; i++) {
      const c = this.cData[i]; if (c.collected) continue
      if (Math.abs(this.player.x + PW / 2 - c.x) < 20 && Math.abs(this.player.y + PH / 2 - c.y) < 20) {
        c.collected = true; this.pCoins++
        SFX.coin()
        const spr = this.coinSprites[i]; if (spr) {
          this.spawnPart(c.x, c.y, 6, 0xFFD93D, 3, 2)
          this.tweens.add({ targets: spr, alpha: 0, y: c.y - 30, scaleX: 1.5, scaleY: 1.5, duration: 300, onComplete: () => spr.setVisible(false) })
        }
      }
    }
  }

  private dropHeart(x: number, y: number) {
    const spr = this.add.sprite(0, 0, 'heart').setDepth(4)
    const cont = this.add.container(x, y, [spr]).setDepth(4)
    this.tweens.add({ targets: spr, y: -3, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    const hd = { x, y, collected: false, bob: 0, timer: 600, sprite: cont }
    this.hData.push(hd)
  }

  private updateHearts() {
    for (let i = this.hData.length - 1; i >= 0; i--) {
      const hd = this.hData[i]; if (hd.collected) continue
      hd.timer--
      if (hd.timer <= 0) { hd.collected = true; hd.sprite.destroy(); this.hData.splice(i, 1); continue }
      if (Math.abs(this.player.x + PW / 2 - hd.x) < 22 && Math.abs(this.player.y + PH / 2 - hd.y) < 22) {
        hd.collected = true; this.pHp = Math.min(this.pMaxHp, this.pHp + 25)
        this.spawnPart(hd.x, hd.y, 8, 0xFF4444, 3, 2)
        this.spawnDmg(hd.x, hd.y, '+25 HP', 0x44FF44)
        SFX.heal()
        this.tweens.add({ targets: hd.sprite, alpha: 0, y: hd.y - 20, duration: 300, onComplete: () => hd.sprite.destroy() })
        this.hData.splice(i, 1)
      }
    }
  }

  private updateCheckpoints() {
    for (const cp of this.cpData) {
      if (!cp.activated && Math.abs(this.player.x + PW / 2 - cp.x) < 20 && Math.abs(this.player.y + PH - cp.y) < 10) {
        cp.activated = true; this.cpX = cp.x - PW / 2; this.cpY = cp.y - PH
        this.spawnPart(cp.x, cp.y - 25, 10, 0xFFD93D, 4, 3)
        SFX.checkpoint()
      }
    }
  }

  private updateDoors() {
    this.nearbyDoor = null
    for (let i = 0; i < this.doorData.length; i++) {
      const d = this.doorData[i]
      if (Math.abs(this.player.x + PW / 2 - (d.x + 16)) < DOOR_PROX) { this.nearbyDoor = d; break }
    }
    for (let i = 0; i < this.doorData.length; i++) {
      const d = this.doorData[i]
      const spr = this.doorSprites[i]
      if (spr) {
        const isNear = this.nearbyDoor !== null && this.nearbyDoor.level.id === d.level.id
        if (isNear && d.level.status !== 'LOCKED') spr.setAlpha(1)
        else spr.setAlpha(0.85)
      }
    }
  }

  private updateCamera() {
    const target = this.player.x - W / 2 + PW / 2
    this.camX += (target - this.camX) * 0.08
    this.camX = Phaser.Math.Clamp(this.camX, 0, WORLD_W - W)
    if (this.camShakeI > 0) {
      this.cameras.main.setScroll(
        this.camX + (Math.random() - 0.5) * this.camShakeI * 2,
        (Math.random() - 0.5) * this.camShakeI * 2
      )
      this.camShakeI *= 0.85
      if (this.camShakeI < 0.5) { this.camShakeI = 0; this.cameras.main.setScroll(this.camX, 0) }
    } else {
      this.cameras.main.setScroll(this.camX, 0)
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--
      if (p.life <= 0) this.particles.splice(i, 1)
    }
    for (let i = this.dmgNums.length - 1; i >= 0; i--) {
      const d = this.dmgNums[i]; d.y -= 1.2; d.life--
      d.txt.setPosition(d.x - this.camX, d.y).setAlpha(d.life / 40)
      if (d.life <= 0) { d.txt.destroy(); this.dmgNums.splice(i, 1) }
    }
  }

  private handleInteract() {
    if (!this.nearbyDoor || !this.gameRunning) return
    SFX.door()
    if (this.callbacks?.onLevelGate(this.nearbyDoor.level)) this.callbacks?.onLevelEnter(this.nearbyDoor.level)
  }

  respawn() {
    this.pHp = this.pMaxHp
    this.player.x = this.cpX
    this.player.y = this.cpY
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(0, 0)
    this.pInv = 120
    this.pCoins = Math.max(0, this.pCoins - 10)
    this.gameRunning = true
    this.pDmgFlash = 0
    this.camX = 0
    this.cameras.main.setScroll(0, 0)
  }

  private spawnPart(x: number, y: number, count: number, color: number, speed: number, size: number) {
    for (let i = 0; i < count; i++) this.particles.push({
      x, y, vx: (Math.random() - 0.5) * speed, vy: -Math.random() * speed * 0.8 - 1,
      life: 20 + Math.random() * 15, maxLife: 35, color, size: size * (0.5 + Math.random() * 0.5),
    })
  }

  private spawnDmg(x: number, y: number, text: string, color: number) {
    const txt = this.add.text(x, y - 10, text, { fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold', color: `#${color.toString(16).padStart(6, '0')}` }).setDepth(10)
    this.dmgNums.push({ x, y: y - 10, text, life: 40, color, txt })
  }

  private drawBG() {
    const g = this.bgGfx; g.clear()
    const pal = WORLD_PALETTES[this.themeKey] || WORLD_PALETTES.english
    g.fillGradientStyle(hex(pal.skyTop), hex(pal.skyTop), hex(pal.skyBot), hex(pal.skyBot), 1)
    g.fillRect(0, 0, W, H)

    const co1 = -(this.camX * 0.15) % 800
    g.fillStyle(hex(pal.hillFar), 0.5)
    for (let i = -1; i <= 2; i++) { const hx = co1 + i * 400; g.fillTriangle(hx, GROUND_Y, hx + 100, GROUND_Y - 50, hx + 200, GROUND_Y) }
    const co2 = -(this.camX * 0.3) % 600
    g.fillStyle(hex(pal.hillMid), 0.6)
    for (let i = -1; i <= 2; i++) { const hx = co2 + i * 300; g.fillTriangle(hx, GROUND_Y, hx + 75, GROUND_Y - 35, hx + 150, GROUND_Y) }
    const co3 = -(this.camX * 0.5) % 600
    g.fillStyle(hex(pal.hillNear))
    for (let i = -1; i <= 2; i++) { const hx = co3 + i * 300; g.fillTriangle(hx, GROUND_Y, hx + 60, GROUND_Y - 25, hx + 120, GROUND_Y) }
  }

  private drawGround() {
    const g = this.groundGfx; g.clear()
    for (const s of this.platGroup.getChildren() as Phaser.GameObjects.Sprite[]) {
      const b = s.body as Phaser.Physics.Arcade.Body
      const isGround = s.displayHeight > 30
      if (isGround) {
        g.fillStyle(hex(WORLD_PALETTES[this.themeKey]?.groundTop || '#7A9B6B'))
        g.fillRect(b.x, b.y, s.displayWidth, 3)
      }
    }
  }

  private drawSpikes() {
    const g = this.spikeGfx; g.clear()
    const world = getWorldData(this.duniaId)
    for (const sp of world.spikes) { g.fillStyle(0xAAAAAA); g.fillTriangle(sp.x, sp.y + 14, sp.x + 7, sp.y, sp.x + 14, sp.y + 14) }
  }

  private drawCheckpoints() {
    const g = this.cpGfx; g.clear()
    for (const cp of this.cpData) {
      const cx = cp.x
      g.fillStyle(cp.activated ? 0xFFD93D : 0x666666); g.fillRect(cx - 2, cp.y - 30, 4, 30)
      if (cp.activated) { g.fillStyle(0xFFD93D); g.fillCircle(cx, cp.y - 30, 6); g.fillStyle(0xFFFFFF); g.fillCircle(cx - 1, cp.y - 31, 2) }
      else { g.fillStyle(0x444444); g.fillCircle(cx, cp.y - 30, 5) }
    }
  }

  private drawAttack() {
    const g = this.attackGfx; g.clear()
    if (this.pAtkTimer > 0) {
      const prog = 1 - (this.pAtkTimer / ATK_DUR)
      const alpha = this.pAtkTimer > 3 ? 0.35 : 0.15
      g.fillStyle(0xFFD93D, alpha)
      const px = this.player.x; const py = this.player.y
      if (this.pDir > 0) g.fillTriangle(px + PW, py + 4, px + PW + ATK_RANGE * 0.7, py + PH * 0.5 - prog * 20, px + PW + ATK_RANGE * 0.3, py + PH * 0.3 + prog * 15)
      else g.fillTriangle(px, py + 4, px - ATK_RANGE * 0.7, py + PH * 0.5 - prog * 20, px - ATK_RANGE * 0.3, py + PH * 0.3 + prog * 15)
    }
  }

  private drawParticles() {
    const g = this.particleGfx; g.clear()
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife
      g.fillStyle(p.color, alpha)
      g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }
  }

  private drawDmgNums() { /* handled in updateParticles */ }

  shutdown() { this.scene.stop('HUDScene') }
}
