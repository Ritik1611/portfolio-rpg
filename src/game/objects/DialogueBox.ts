import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, THEME, FONT_DISPLAY, FONT_BODY } from '../config'

const BOX_HEIGHT = 96
const PADDING = 16
const TYPE_DELAY = 22
const PORTRAIT_SIZE = 52
const TEXT_X_NO_PORTRAIT = PADDING + 4
const TEXT_X_WITH_PORTRAIT = PADDING + PORTRAIT_SIZE + 18

/**
 * A GBA-style dialogue box: parchment panel, navy border, typewriter text,
 * blinking "next" indicator, and an optional speaker portrait. Call
 * showLines() with an array of strings and it will step through them one
 * at a time, waiting for input between each. The whole box is pinned to
 * the camera (scrollFactor 0) so it stays put while the world scrolls.
 */
export class DialogueBox {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private panel: Phaser.GameObjects.Rectangle
  private border: Phaser.GameObjects.Rectangle
  private text: Phaser.GameObjects.Text
  private indicator: Phaser.GameObjects.Text
  private portrait: Phaser.GameObjects.Image
  private portraitFrame: Phaser.GameObjects.Rectangle
  private speakerBg: Phaser.GameObjects.Rectangle
  private speakerText: Phaser.GameObjects.Text
  private typing = false
  private currentFull = ''
  private typeTimer?: Phaser.Time.TimerEvent
  private advanceHandlerActive = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    const y = GAME_HEIGHT - BOX_HEIGHT - 12

    this.border = scene.add
      .rectangle(GAME_WIDTH / 2, y + BOX_HEIGHT / 2, GAME_WIDTH - 16, BOX_HEIGHT + 8, 0x000000)
      .setStrokeStyle(4, hexToNum(THEME.inkNavy))
      .setFillStyle(hexToNum(THEME.inkNavy))

    this.panel = scene.add
      .rectangle(GAME_WIDTH / 2, y + BOX_HEIGHT / 2, GAME_WIDTH - 24, BOX_HEIGHT, hexToNum(THEME.parchment))
      .setStrokeStyle(3, hexToNum(THEME.steelGrey))

    this.portraitFrame = scene.add
      .rectangle(
        PADDING + 14 + PORTRAIT_SIZE / 2,
        y + BOX_HEIGHT / 2,
        PORTRAIT_SIZE + 4,
        PORTRAIT_SIZE + 4,
        hexToNum(THEME.inkNavy),
      )
      .setStrokeStyle(2, hexToNum(THEME.emberGold))
      .setVisible(false)

    this.portrait = scene.add
      .image(PADDING + 14 + PORTRAIT_SIZE / 2, y + BOX_HEIGHT / 2, '__DEFAULT')
      .setDisplaySize(PORTRAIT_SIZE, PORTRAIT_SIZE)
      .setVisible(false)

    this.speakerBg = scene.add
      .rectangle(PADDING + 62, y - 6, 120, 18, hexToNum(THEME.inkNavy))
      .setStrokeStyle(2, hexToNum(THEME.emberGold))
      .setVisible(false)
    this.speakerText = scene.add
      .text(PADDING + 62, y - 6, '', { fontFamily: FONT_DISPLAY, fontSize: '8px', color: THEME.emberGold })
      .setOrigin(0.5)
      .setVisible(false)

    this.text = scene.add.text(TEXT_X_NO_PORTRAIT, y + 12, '', {
      fontFamily: FONT_BODY,
      fontSize: '20px',
      color: THEME.inkNavy,
      wordWrap: { width: GAME_WIDTH - TEXT_X_NO_PORTRAIT - PADDING - 8 },
      lineSpacing: 4,
    })

    this.indicator = scene.add
      .text(GAME_WIDTH - PADDING - 34, y + BOX_HEIGHT - 22, '▼', {
        fontFamily: FONT_BODY,
        fontSize: '18px',
        color: THEME.inkNavy,
      })
      .setVisible(false)

    scene.tweens.add({
      targets: this.indicator,
      y: '+=4',
      duration: 400,
      yoyo: true,
      repeat: -1,
    })

    this.container = scene.add.container(0, 0, [
      this.border,
      this.panel,
      this.portraitFrame,
      this.portrait,
      this.text,
      this.indicator,
      this.speakerBg,
      this.speakerText,
    ])
    this.container.setDepth(1000)
    this.container.setScrollFactor(0)
    this.container.setVisible(false)
  }

  /** Show or hide the speaker's name plate above the box. */
  setSpeaker(name: string | null) {
    if (name) {
      this.speakerBg.setVisible(true)
      this.speakerText.setText(name.toUpperCase()).setVisible(true)
    } else {
      this.speakerBg.setVisible(false)
      this.speakerText.setVisible(false)
    }
  }

  /** Show or hide the speaker portrait; pass null to hide it and reclaim text width. */
  setPortrait(textureKey: string | null) {
    if (textureKey) {
      this.portrait.setTexture(textureKey).setVisible(true)
      this.portraitFrame.setVisible(true)
      this.text.setX(TEXT_X_WITH_PORTRAIT)
      this.text.setWordWrapWidth(GAME_WIDTH - TEXT_X_WITH_PORTRAIT - PADDING - 8)
    } else {
      this.portrait.setVisible(false)
      this.portraitFrame.setVisible(false)
      this.text.setX(TEXT_X_NO_PORTRAIT)
      this.text.setWordWrapWidth(GAME_WIDTH - TEXT_X_NO_PORTRAIT - PADDING - 8)
    }
  }

  /** Step through a series of lines, calling onComplete when the player has advanced past the last one. */
  showLines(lines: string[], onComplete: () => void) {
    let i = 0
    const next = () => {
      if (i >= lines.length) {
        onComplete()
        return
      }
      this.showLine(lines[i], () => {
        i++
        next()
      })
    }
    next()
  }

  /** Show a single line, calling onAdvance once the player presses through it. */
  showLine(text: string, onAdvance: () => void) {
    this.container.setVisible(true)
    this.currentFull = text
    this.text.setText('')
    this.indicator.setVisible(false)
    this.typing = true

    let i = 0
    this.typeTimer?.destroy()
    this.typeTimer = this.scene.time.addEvent({
      delay: TYPE_DELAY,
      loop: true,
      callback: () => {
        this.text.setText(this.text.text + this.currentFull[i])
        i++
        if (i >= this.currentFull.length) {
          this.typeTimer?.destroy()
          this.typing = false
          this.indicator.setVisible(true)
        }
      },
    })

    this.waitForAdvance(() => {
      if (this.typing) {
        // skip typing, show full line instantly
        this.typeTimer?.destroy()
        this.text.setText(this.currentFull)
        this.typing = false
        this.indicator.setVisible(true)
        this.waitForAdvance(onAdvance)
      } else {
        onAdvance()
      }
    })
  }

  private waitForAdvance(cb: () => void) {
    if (this.advanceHandlerActive) return
    this.advanceHandlerActive = true

    const handler = () => {
      this.advanceHandlerActive = false
      cleanup()
      cb()
    }
    const cleanup = () => {
      this.scene.input.keyboard?.off('keydown-ENTER', handler)
      this.scene.input.keyboard?.off('keydown-SPACE', handler)
      this.scene.input.off('pointerdown', handler)
    }

    this.scene.input.keyboard?.once('keydown-ENTER', handler)
    this.scene.input.keyboard?.once('keydown-SPACE', handler)
    this.scene.input.once('pointerdown', handler)
  }

  get isOpen(): boolean {
    return this.container.visible
  }

  setVisible(visible: boolean) {
    this.container.setVisible(visible)
  }

  destroy() {
    this.typeTimer?.destroy()
    this.container.destroy()
  }
}

export function hexToNum(hex: string): number {
  return parseInt(hex.replace('#', '0x'), 16)
}
