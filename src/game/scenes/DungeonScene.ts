import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, THEME, FONT_DISPLAY, FONT_BODY } from '../config'
import { hexToNum } from '../objects/DialogueBox'
import type { DungeonConfig } from '../data/dungeons'

export interface DungeonSceneData {
  config: DungeonConfig
  onComplete: (won: boolean) => void
}

/**
 * A generic engine for project "dungeons": Phaser handles the portal pull,
 * the guide's framing dialogue, and the resolution beat; the actual puzzle
 * content lives entirely in React (a different component per project) so
 * each dungeon can have a genuinely different mechanic, not a reskin.
 */
export class DungeonScene extends Phaser.Scene {
  private config!: DungeonConfig
  private onExit!: (won: boolean) => void
  private messageText!: Phaser.GameObjects.Text
  private titleText!: Phaser.GameObjects.Text
  private guideMarker!: Phaser.GameObjects.Arc
  private ended = false
  private onExperienceExit?: (e: Event) => void

  constructor() {
    super({ key: 'Dungeon' })
  }

  init(data: DungeonSceneData) {
    this.config = data.config
    this.onExit = data.onComplete
    this.ended = false
  }

  create() {
    this.cameras.main.setBackgroundColor(THEME.inkNavy)
    this.cameras.main.fadeIn(400)
    this.cameras.main.flash(250, 120, 80, 220, false)

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, hexToNum(THEME.twilightPurple)).setDepth(0)

    this.titleText = this.add
      .text(GAME_WIDTH / 2, 24, this.config.worldTitle, { fontFamily: FONT_DISPLAY, fontSize: '11px', color: THEME.emberGold })
      .setOrigin(0.5)
      .setDepth(10)

    this.guideMarker = this.add.circle(GAME_WIDTH / 2, 60, 9, hexToNum(this.config.guideColor)).setDepth(10)
    this.tweens.add({ targets: this.guideMarker, scale: 1.3, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    this.messageText = this.add
      .text(24, 90, '', {
        fontFamily: FONT_BODY,
        fontSize: '16px',
        color: THEME.parchment,
        wordWrap: { width: GAME_WIDTH - 48 },
        lineSpacing: 5,
        align: 'center',
      })
      .setOrigin(0.5, 0)
      .setDepth(10)
    this.messageText.setX(GAME_WIDTH / 2)

    this.input.keyboard?.on('keydown-ESC', () => this.leave(false))

    this.runLines([...this.config.introLines, ...this.config.handoffLines], () => this.openExperience())
  }

  private queueMessage(text: string, after: () => void, holdMs = 1300) {
    this.messageText.setText(text)
    let done = false
    const proceed = () => {
      if (done) return
      done = true
      cleanup()
      after()
    }
    const cleanup = () => {
      this.input.keyboard?.off('keydown-ENTER', proceed)
      this.input.keyboard?.off('keydown-SPACE', proceed)
    }
    this.input.keyboard?.once('keydown-ENTER', proceed)
    this.input.keyboard?.once('keydown-SPACE', proceed)
    this.time.delayedCall(holdMs, proceed)
  }

  private runLines(lines: string[], after: () => void) {
    let i = 0
    const next = () => {
      if (i >= lines.length) {
        after()
        return
      }
      this.queueMessage(lines[i], () => {
        i++
        next()
      })
    }
    next()
  }

  private openExperience() {
    this.messageText.setText('(open in your browser \u2014 press Esc here any time to step back)')
    this.input.keyboard!.enabled = false
    this.input.keyboard!.disableGlobalCapture()

    this.onExperienceExit = (e: Event) => {
      const detail = (e as CustomEvent<{ completed: boolean }>).detail
      this.input.keyboard!.enabled = true
      this.input.keyboard!.enableGlobalCapture()
      window.removeEventListener(this.config.exitEventName, this.onExperienceExit as EventListener)
      this.onExperienceExit = undefined
      if (detail?.completed) {
        this.runResolution()
      } else {
        this.runLines(this.config.bailLines, () => this.leave(false))
      }
    }
    window.addEventListener(this.config.exitEventName, this.onExperienceExit)
    window.dispatchEvent(new CustomEvent(this.config.openEventName))
  }

  private runResolution() {
    this.titleText.setText(this.config.resolutionTitle)
    this.runLines(this.config.resolutionLines, () => this.leave(true))
  }

  private leave(won: boolean) {
    if (this.ended) return
    this.ended = true
    if (this.onExperienceExit) {
      window.removeEventListener(this.config.exitEventName, this.onExperienceExit)
      this.onExperienceExit = undefined
    }
    this.input.keyboard!.enabled = true
    this.input.keyboard!.enableGlobalCapture()
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.onExit(won)
      this.scene.stop()
    })
  }
}
