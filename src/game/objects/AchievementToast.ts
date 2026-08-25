import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, THEME, FONT_DISPLAY, FONT_BODY } from '../config'
import { hexToNum } from './DialogueBox'

/** Slides a small badge banner in from the top of the screen, holds, then slides away. */
export function showAchievement(scene: Phaser.Scene, title: string, subtitle: string) {
  const width = 320
  const restY = 70

  const bg = scene.add
    .rectangle(0, 0, width, 54, hexToNum(THEME.inkNavy))
    .setStrokeStyle(3, hexToNum(THEME.emberGold))
  const icon = scene.add
    .text(-width / 2 + 20, 0, '\u2666', { fontFamily: FONT_DISPLAY, fontSize: '16px', color: THEME.emberGold })
    .setOrigin(0.5)
  const titleText = scene.add
    .text(-width / 2 + 42, -11, title, { fontFamily: FONT_DISPLAY, fontSize: '9px', color: THEME.parchment })
    .setOrigin(0, 0.5)
  const subText = scene.add
    .text(-width / 2 + 42, 11, subtitle, { fontFamily: FONT_BODY, fontSize: '14px', color: THEME.mossGreen })
    .setOrigin(0, 0.5)

  const container = scene.add.container(GAME_WIDTH / 2, -40, [bg, icon, titleText, subText])
  container.setDepth(4000)
  container.setScrollFactor(0)

  scene.tweens.add({
    targets: container,
    y: restY,
    duration: 420,
    ease: 'Back.Out',
    hold: 2200,
    yoyo: true,
    onComplete: () => container.destroy(),
  })
}

/** A lighter-weight toast for "X leveled up!" moments. */
export function showLevelUp(scene: Phaser.Scene, skill: string, level: number, offsetY = 0) {
  const width = 220
  const restY = 70 + offsetY

  const bg = scene.add
    .rectangle(0, 0, width, 40, hexToNum(THEME.inkNavy))
    .setStrokeStyle(2, hexToNum(THEME.mossGreen))
  const text = scene.add
    .text(0, 0, `${skill} \u2192 Lv.${level}`, { fontFamily: FONT_BODY, fontSize: '15px', color: THEME.mossGreen })
    .setOrigin(0.5)

  const container = scene.add.container(GAME_WIDTH / 2, -30, [bg, text])
  container.setDepth(4000)
  container.setScrollFactor(0)

  scene.tweens.add({
    targets: container,
    y: restY,
    duration: 350,
    ease: 'Back.Out',
    hold: 1600,
    yoyo: true,
    onComplete: () => container.destroy(),
  })
}

/** A toast for escape-room-style clue discovery. */
export function showClueFound(scene: Phaser.Scene, source: string) {
  const width = 260
  const restY = 70

  const bg = scene.add.rectangle(0, 0, width, 44, hexToNum(THEME.inkNavy)).setStrokeStyle(2, hexToNum(THEME.emberGold))
  const text = scene.add
    .text(0, 0, `\u2726 CLUE FOUND \u2014 ${source}`, { fontFamily: FONT_BODY, fontSize: '15px', color: THEME.emberGold })
    .setOrigin(0.5)

  const container = scene.add.container(GAME_WIDTH / 2, -30, [bg, text])
  container.setDepth(4000)
  container.setScrollFactor(0)

  scene.tweens.add({
    targets: container,
    y: restY,
    duration: 350,
    ease: 'Back.Out',
    hold: 1800,
    yoyo: true,
    onComplete: () => container.destroy(),
  })
}

/** A sharp, hard-to-miss warning banner right before a wild encounter interrupts movement. */
export function showWildAlert(scene: Phaser.Scene) {
  const bg = scene.add.rectangle(0, 0, 260, 50, hexToNum(THEME.signalRed)).setStrokeStyle(3, hexToNum(THEME.inkNavy))
  const text = scene.add
    .text(0, 0, '\u26A0 WILD ENCOUNTER!', { fontFamily: FONT_DISPLAY, fontSize: '12px', color: THEME.parchment })
    .setOrigin(0.5)

  const container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, [bg, text])
  container.setDepth(5000)
  container.setScrollFactor(0)
  container.setScale(0.4)
  container.setAlpha(0)

  scene.tweens.add({
    targets: container,
    scale: 1,
    alpha: 1,
    duration: 180,
    ease: 'Back.Out',
    onComplete: () => {
      scene.tweens.add({ targets: container, alpha: 0, duration: 300, delay: 450, onComplete: () => container.destroy() })
    },
  })
}
