import Phaser from 'phaser'
import { THEME, FONT_BODY } from '../config'
import { hexToNum } from './DialogueBox'

interface ChoiceMenuOptions {
  x: number
  y: number
  options: string[]
  fontSize?: string
  spacing?: number
  initialIndex?: number
  onSelect: (index: number) => void
}

/** A simple vertical list menu: arrow keys + Enter, or pointer click. */
export class ChoiceMenu {
  private scene: Phaser.Scene
  private items: Phaser.GameObjects.Text[] = []
  private cursor: Phaser.GameObjects.Text
  private selected = 0
  private opts: ChoiceMenuOptions
  private keyHandlers: Array<[string, () => void]> = []

  constructor(scene: Phaser.Scene, opts: ChoiceMenuOptions) {
    this.scene = scene
    this.opts = opts
    const spacing = opts.spacing ?? 26

    this.cursor = scene.add
      .text(opts.x - 20, opts.y, '►', {
        fontFamily: FONT_BODY,
        fontSize: opts.fontSize ?? '18px',
        color: THEME.emberGold,
      })
      .setScrollFactor(0)
      .setDepth(1001)

    this.items = opts.options.map((label, i) => {
      const t = scene.add
        .text(opts.x, opts.y + i * spacing, label, {
          fontFamily: FONT_BODY,
          fontSize: opts.fontSize ?? '18px',
          color: THEME.parchment,
        })
        .setScrollFactor(0)
        .setDepth(1001)
        .setInteractive({ useHandCursor: true })
      t.on('pointerover', () => this.setSelected(i))
      t.on('pointerdown', () => this.confirm(i))
      return t
    })

    const up = () => this.setSelected((this.selected - 1 + this.items.length) % this.items.length)
    const down = () => this.setSelected((this.selected + 1) % this.items.length)
    const confirm = () => this.confirm(this.selected)

    scene.input.keyboard?.on('keydown-UP', up)
    scene.input.keyboard?.on('keydown-DOWN', down)
    scene.input.keyboard?.on('keydown-ENTER', confirm)
    this.keyHandlers = [
      ['keydown-UP', up],
      ['keydown-DOWN', down],
      ['keydown-ENTER', confirm],
    ]

    this.setSelected(opts.initialIndex ?? 0)
  }

  private setSelected(i: number) {
    this.selected = i
    this.cursor.setY(this.opts.y + i * (this.opts.spacing ?? 26))
    this.items.forEach((t, idx) => t.setColor(idx === i ? THEME.emberGold : THEME.parchment))
  }

  private confirm(i: number) {
    this.destroy()
    this.opts.onSelect(i)
  }

  destroy() {
    this.keyHandlers.forEach(([evt, fn]) => this.scene.input.keyboard?.off(evt, fn))
    this.cursor.destroy()
    this.items.forEach((t) => t.destroy())
  }
}

// re-export for scenes that only need the color helper alongside this file
export { hexToNum }
