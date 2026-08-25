import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, THEME, FONT_DISPLAY } from '../config'
import { hexToNum } from './DialogueBox'

export interface CodeEntryHandle {
  destroy: () => void
  shakeWrong: () => void
}

/**
 * Shows a digit-entry prompt (like a keypad lock). Digits 0-9 type in,
 * Backspace deletes, Enter submits whatever's been typed so far. The
 * caller decides if the code is correct and calls shakeWrong() to reject
 * and clear it, or destroy() once it's solved.
 */
export function promptCodeEntry(
  scene: Phaser.Scene,
  length: number,
  title: string,
  onSubmit: (code: string) => void,
  onCancel?: () => void,
): CodeEntryHandle {
  let code = ''
  const y = GAME_HEIGHT / 2 - 10

  const box = scene.add.rectangle(0, 0, 220, 60, hexToNum(THEME.inkNavy)).setStrokeStyle(3, hexToNum(THEME.emberGold))
  const titleText = scene.add
    .text(0, -18, title, { fontFamily: FONT_DISPLAY, fontSize: '9px', color: THEME.parchment })
    .setOrigin(0.5)
  const digitsText = scene.add
    .text(0, 10, '', { fontFamily: FONT_DISPLAY, fontSize: '18px', color: THEME.emberGold })
    .setOrigin(0.5)

  const container = scene.add.container(GAME_WIDTH / 2, y, [box, titleText, digitsText])
  container.setDepth(2500)
  container.setScrollFactor(0)

  const render = () => {
    const slots = Array.from({ length }, (_, i) => code[i] ?? '_').join('  ')
    digitsText.setText(slots)
  }
  render()

  const onKey = (event: KeyboardEvent) => {
    if (/^[0-9]$/.test(event.key) && code.length < length) {
      code += event.key
      render()
      return
    }
    if (event.key === 'Backspace') {
      code = code.slice(0, -1)
      render()
      return
    }
    if (event.key === 'Enter' && code.length > 0) {
      onSubmit(code)
      return
    }
    if (event.key === 'Escape') {
      destroy()
      onCancel?.()
    }
  }
  scene.input.keyboard?.on('keydown', onKey)

  const hint = scene.add
    .text(0, 26, 'Esc to step away', { fontFamily: FONT_DISPLAY, fontSize: '7px', color: THEME.steelGrey })
    .setOrigin(0.5)
  container.add(hint)

  const shakeWrong = () => {
    const baseX = container.x
    scene.tweens.add({ targets: container, x: baseX + 6, duration: 40, yoyo: true, repeat: 4, onComplete: () => container.setX(baseX) })
    code = ''
    render()
  }

  const destroy = () => {
    scene.input.keyboard?.off('keydown', onKey)
    container.destroy()
  }

  return { destroy, shakeWrong }
}
