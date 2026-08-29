import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, THEME, FONT_DISPLAY, FONT_BODY } from '../config'
import type { SaveData } from '../config'
import { ChoiceMenu } from '../objects/ChoiceMenu'
import { hexToNum } from '../objects/DialogueBox'
import { PROFILE } from '../../data/profile'

export class MainMenuScene extends Phaser.Scene {
  private lastIndex = 0

  constructor() {
    super({ key: 'MainMenu' })
  }

  create() {
    this.cameras.main.setBackgroundColor(THEME.inkNavy)
    this.cameras.main.fadeIn(300)

    const save = this.registry.get('save') as SaveData
    this.lastIndex = 0

    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 12, GAME_HEIGHT - 12)
      .setStrokeStyle(3, hexToNum(THEME.steelGrey))

    this.add
      .text(GAME_WIDTH / 2, 56, PROFILE.name.toUpperCase(), {
        fontFamily: FONT_DISPLAY,
        fontSize: '22px',
        color: THEME.parchment,
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 88, 'THE JOURNEY', {
        fontFamily: FONT_DISPLAY,
        fontSize: '11px',
        color: THEME.emberGold,
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 112, PROFILE.tagline, {
        fontFamily: FONT_BODY,
        fontSize: '15px',
        color: THEME.steelGrey,
      })
      .setOrigin(0.5)

    if (save.playerName) {
      this.add
        .text(GAME_WIDTH / 2, 136, `Welcome back, ${save.playerName}`, {
          fontFamily: FONT_BODY,
          fontSize: '15px',
          color: THEME.mossGreen,
        })
        .setOrigin(0.5)
    }

    this.showMenu()

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 20, '↑↓ to move   Enter to select', {
        fontFamily: FONT_BODY,
        fontSize: '13px',
        color: THEME.steelGrey,
      })
      .setOrigin(0.5)
  }

  private showMenu() {
    const options = ['Begin Adventure', 'Speedrun', 'Trainer Card', 'Settings']
    new ChoiceMenu(this, {
      x: GAME_WIDTH / 2 - 50,
      y: 176,
      options,
      spacing: 28,
      initialIndex: this.lastIndex,
      onSelect: (i) => this.handleSelect(i),
    })
  }

  private handleSelect(index: number) {
    this.lastIndex = index
    switch (index) {
      case 0: {
        const save = this.registry.get('save') as SaveData
        const target = save.hasCompletedIntro ? 'Village' : 'Opening'
        this.cameras.main.fadeOut(300, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start(target)
        })
        break
      }
      case 1: {
        this.cameras.main.fadeOut(250, 0, 0, 0)
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start('Speedrun')
        })
        break
      }
      case 2: { // Trainer Card
        this.cameras.main.flash(180, 26, 28, 44, false)
        window.dispatchEvent(new CustomEvent('open-trainer-card'))
        this.time.delayedCall(0, () => this.showMenu())
        break
      }
      case 3: { // Settings
        this.cameras.main.flash(180, 26, 28, 44, false)
        window.dispatchEvent(new CustomEvent('open-settings'))
        this.time.delayedCall(0, () => this.showMenu())
        break
      }
    }
  }
}
