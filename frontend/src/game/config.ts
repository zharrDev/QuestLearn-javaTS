import Phaser from 'phaser'
import { PlatformerScene } from './scenes/PlatformerScene'
import { HUDScene } from './scenes/HUDScene'
import { GAME_WIDTH, GAME_HEIGHT } from './constants'

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#000000',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 900 },
        debug: false,
        tileBias: 16,
      },
    },
    scene: [PlatformerScene, HUDScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    },
    input: {
      keyboard: true,
      touch: true,
    },
    audio: {
      disableWebAudio: true,
    },
  }
}
