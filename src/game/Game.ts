import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, THEME } from './config'
import { BootScene } from './scenes/BootScene'
import { PreloadScene } from './scenes/PreloadScene'
import { MainMenuScene } from './scenes/MainMenuScene'
import { SpeedrunScene } from './scenes/SpeedrunScene'
import { OpeningScene } from './scenes/OpeningScene'
import { VillageScene } from './scenes/VillageScene'
import { InteriorScene } from './scenes/InteriorScene'
import { DungeonScene } from './scenes/DungeonScene'
import { BattleScene } from './scenes/BattleScene'

export function createGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    pixelArt: true,
    backgroundColor: THEME.inkNavy,
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: [BootScene, PreloadScene, MainMenuScene, SpeedrunScene, OpeningScene, VillageScene, InteriorScene, DungeonScene, BattleScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  }

  return new Phaser.Game(config)
}
