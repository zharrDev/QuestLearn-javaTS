import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants'

const WORLD_NAMES: Record<string, string> = {
  english: 'ENGLISH VILLAGE',
  math: 'MATH DESERT',
  logic: 'LOGIC FOREST',
}

export class HUDScene extends Phaser.Scene {
  private hp = 50
  private maxHp = 50
  private coins = 0
  private themeKey = 'english'
  private worldName = 'ENGLISH VILLAGE'

  private hudGfx!: Phaser.GameObjects.Graphics
  private coinText!: Phaser.GameObjects.Text
  private worldText!: Phaser.GameObjects.Text
  private hintText!: Phaser.GameObjects.Text
  private hintBg!: Phaser.GameObjects.Graphics
  private attackLabel!: Phaser.GameObjects.Text
  private levels: { id: number; nama: string; status: string; isBoss: boolean; xpReward: number }[] = []

  constructor() {
    super({ key: 'HUDScene' })
  }

  init(data: { themeKey: string; levels: { id: number; nama: string; status: string; isBoss: boolean; xpReward: number }[] }) {
    this.themeKey = data.themeKey
    this.worldName = WORLD_NAMES[data.themeKey] || 'WORLD'
    this.levels = data.levels || []
  }

  create() {
    this.hudGfx = this.add.graphics().setDepth(100)

    this.coinText = this.add.text(56, 46, '0', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#FFD93D',
      fontStyle: 'bold',
    }).setDepth(101)

    this.worldText = this.add.text(GAME_WIDTH / 2, 25, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#E8D5B0',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5).setDepth(101)

    this.attackLabel = this.add.text(56, 60, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#E8A93B',
      fontStyle: 'bold',
    }).setDepth(101)

    this.hintBg = this.add.graphics().setDepth(100)
    this.hintText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 38, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0.5).setDepth(101)

    const platformer = this.scene.get('PlatformerScene') as any
    if (platformer) {
      platformer.events.on('hp-change', (hp: number, maxHp: number) => {
        this.hp = hp
        this.maxHp = maxHp
      })
      platformer.events.on('coin-collect', (coins: number) => {
        this.coins = coins
      })
    }
  }

  update() {
    const g = this.hudGfx
    g.clear()

    g.fillStyle(0x1E140A, 0.88)
    g.fillRoundedRect(10, 10, 200, 62, 4)
    g.lineStyle(2, 0xC9A86A)
    g.strokeRoundedRect(10, 10, 200, 62, 4)

    this.drawHearts(g)

    g.fillStyle(0xFFD93D)
    g.fillRect(18, 43, 12, 12)
    g.fillStyle(0xE8A93B)
    g.fillRect(20, 45, 8, 8)

    this.coinText.setText(`${this.coins}`)

    const lvlDone = this.levels.filter(l => l.status === 'COMPLETED').length
    this.worldText.setText(`${this.worldName}  •  ${lvlDone}/${this.levels.length} LEVEL`)

    g.fillStyle(0x1E140A, 0.8)
    g.fillRoundedRect(GAME_WIDTH / 2 - 115, 10, 230, 24, 3)
    g.lineStyle(1, 0xC9A86A)
    g.strokeRoundedRect(GAME_WIDTH / 2 - 115, 10, 230, 24, 3)

    const platformer = this.scene.get('PlatformerScene') as any
    if (platformer && platformer.nearbyDoor) {
      const door = platformer.nearbyDoor
      const isLocked = door.level.status === 'LOCKED'
      const hintW = isLocked ? 360 : 320

      g.fillStyle(0x1E140A, 0.92)
      g.fillRoundedRect(GAME_WIDTH / 2 - hintW / 2, GAME_HEIGHT - 56, hintW, 36, 4)
      g.lineStyle(1, isLocked ? 0xFF4444 : 0xC9A86A)
      g.strokeRoundedRect(GAME_WIDTH / 2 - hintW / 2, GAME_HEIGHT - 56, hintW, 36, 4)

      if (isLocked) {
        this.hintText.setText(`[LOCKED] ${door.level.nama} - Selesaikan soal sebelumnya dulu!`)
        this.hintText.setColor('#FF8888')
      } else {
        this.hintText.setText(`[E / ENTER] Masuk ke ${door.level.nama}`)
        this.hintText.setColor('#FFFFFF')
      }
    } else {
      g.fillStyle(0x1E140A, 0.5)
      g.fillRoundedRect(GAME_WIDTH / 2 - 180, GAME_HEIGHT - 42, 360, 24, 3)
      this.hintText.setText('A/D atau ←/→ untuk bergerak  •  SPACE/W untuk lompat  •  ENTER untuk serang')
      this.hintText.setColor('#888888')
    }

    if (platformer && platformer.pAtkTimer > 0) {
      this.attackLabel.setText('⚔ ATTACK!')
    } else {
      this.attackLabel.setText('')
    }
  }

  private drawHearts(g: Phaser.GameObjects.Graphics) {
    const heartSize = 14
    const heartGap = 3
    const maxHearts = 5
    const hpPerHeart = this.maxHp / maxHearts

    for (let i = 0; i < maxHearts; i++) {
      const hx = 22 + i * (heartSize + heartGap)
      const hy = 20
      const heartFill = Phaser.Math.Clamp((this.hp - i * hpPerHeart) / hpPerHeart, 0, 1)

      g.fillStyle(0x2A1A1A)
      g.fillCircle(hx + 3, hy, 4)
      g.fillCircle(hx + heartSize - 3, hy, 4)
      g.fillTriangle(hx - 1, hy + 2, hx + heartSize + 1, hy + 2, hx + heartSize / 2, hy + heartSize - 2)

      if (heartFill > 0) {
        g.fillStyle(0xFF4444)
        g.fillCircle(hx + 3, hy, 3.5)
        g.fillCircle(hx + heartSize - 3, hy, 3.5)
        g.fillTriangle(hx, hy + 2, hx + heartSize, hy + 2, hx + heartSize / 2, hy + heartSize - 3)

        g.fillStyle(0xFF8888)
        g.fillRect(hx + 4, hy - 3, 3, 3)
      }
    }
  }
}
