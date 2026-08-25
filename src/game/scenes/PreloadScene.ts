import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, THEME, FONT_DISPLAY } from '../config'
import { hexToNum } from '../objects/DialogueBox'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preload' })
  }

  create() {
    const cx = GAME_WIDTH / 2
    const cy = GAME_HEIGHT / 2

    const label = this.add
      .text(cx, cy - 30, 'LOADING', {
        fontFamily: FONT_DISPLAY,
        fontSize: '12px',
        color: THEME.parchment,
      })
      .setOrigin(0.5)

    const boxW = 220
    this.add
      .rectangle(cx, cy + 10, boxW, 16, 0x000000)
      .setStrokeStyle(2, hexToNum(THEME.parchment))
    const fill = this.add
      .rectangle(cx - boxW / 2 + 2, cy + 10, 0, 12, hexToNum(THEME.emberGold))
      .setOrigin(0, 0.5)

    // Wait for the pixel webfonts to actually be ready so text doesn't
    // flash in the fallback font, while animating a small progress bar.
    const fontsReady = (document as any).fonts?.ready ?? Promise.resolve()
    let progress = 0

    const tick = this.time.addEvent({
      delay: 40,
      loop: true,
      callback: () => {
        progress = Math.min(progress + 0.06, 0.92)
        fill.width = (boxW - 4) * progress
      },
    })

    fontsReady.then(() => {
      tick.destroy()
      this.tweens.addCounter({
        from: fill.width,
        to: boxW - 4,
        duration: 150,
        onUpdate: (tw) => {
          fill.width = tw.getValue() as number
        },
        onComplete: () => {
          label.setText('READY')
          this.time.delayedCall(200, () => this.scene.start('MainMenu'))
        },
      })
    })
  }
}
