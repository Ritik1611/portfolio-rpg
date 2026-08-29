import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, THEME, FONT_DISPLAY, FONT_BODY } from '../config'
import { hexToNum } from '../objects/DialogueBox'
import { generateActorTexture, idleFrame } from '../gfx/pixelActor'
import { generateCrestTexture } from '../gfx/battleArt'
import type { CrestStyle } from '../gfx/battleArt'
import { PALETTES } from '../data/npcs'
import { PROFILE } from '../../data/profile'
import { GYM_BATTLES, EXAM_BATTLES, findProject } from '../data/battles'

interface Beat {
  title: string
  subtitle: string
  detail?: string
  accent: string
  iconStyle: CrestStyle
  crestSeed: string
  isBattle: boolean
  big?: boolean
}

export class SpeedrunScene extends Phaser.Scene {
  private beats: Beat[] = []
  private index = 0
  private beatGroup?: Phaser.GameObjects.Container
  private beatTimer?: Phaser.Time.TimerEvent
  private advancing = false
  private walker!: Phaser.GameObjects.Sprite

  constructor() {
    super({ key: 'Speedrun' })
  }

  create() {
    this.index = 0
    this.advancing = false
    this.cameras.main.setBackgroundColor(THEME.inkNavy)
    this.cameras.main.fadeIn(300)

    this.beats = this.buildBeats()

    // ground + continuously-walking player, running the whole time in the background
    this.add.rectangle(GAME_WIDTH / 2, 282, GAME_WIDTH, 2, hexToNum(THEME.steelGrey), 0.35)
    generateActorTexture(this, 'player', PALETTES.player)
    this.walker = this.add.sprite(20, 268, 'player', idleFrame('right')).setScale(2)
    this.walker.anims.play('player-walk-right')
    this.tweens.add({
      targets: this.walker,
      x: GAME_WIDTH - 20,
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onYoyo: () => this.walker.anims.play('player-walk-left', true),
      onRepeat: () => this.walker.anims.play('player-walk-right', true),
    })

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 10, 'ENTER to skip a beat · Esc to jump to Resume', {
        fontFamily: FONT_BODY,
        fontSize: '12px',
        color: THEME.steelGrey,
      })
      .setOrigin(0.5, 1)
      .setAlpha(0.85)
      .setDepth(999)

    this.input.keyboard?.on('keydown-ENTER', () => this.skipBeat())
    this.input.keyboard?.on('keydown-SPACE', () => this.skipBeat())
    this.input.keyboard?.on('keydown-ESC', () => this.finish())

    this.showBeat(0)
  }

  private buildBeats(): Beat[] {
    const beats: Beat[] = []

    beats.push({
      title: PROFILE.name,
      subtitle: 'THE JOURNEY — SPEEDRUN',
      accent: THEME.emberGold,
      iconStyle: 'book',
      crestSeed: 'speedrun-title',
      isBattle: false,
      big: true,
    })

    PROFILE.education.forEach((e, i) => {
      const exam = EXAM_BATTLES.find((x) => (e.detail === 'SSC' && x.id === 'ssc') || (e.detail === 'HSC' && x.id === 'hsc'))
      beats.push({
        title: `${e.detail} \u00b7 ${e.result}`,
        subtitle: e.institution,
        detail: e.years,
        accent: exam?.accent ?? THEME.steelGrey,
        iconStyle: exam?.iconStyle ?? 'book',
        crestSeed: `speedrun-edu-${i}`,
        isBattle: !!exam,
      })
    })

    PROFILE.employment.forEach((job, i) => {
      const gym = GYM_BATTLES.find(
        (g) => (job.org === 'Academor' && g.id === 'academor') || (job.org.includes('VESIT') && g.id === 'vesit-lab'),
      )
      beats.push({
        title: `${job.role} \u00b7 ${job.org}`,
        subtitle: job.bullets[0],
        detail: job.period,
        accent: gym?.accent ?? THEME.mossGreen,
        iconStyle: gym?.iconStyle ?? 'bars',
        crestSeed: `speedrun-job-${i}`,
        isBattle: !!gym,
      })
    })

    PROFILE.projects.forEach((p) => {
      const battle = findProject(p.id)
      beats.push({
        title: p.codename,
        subtitle: p.bullets[0],
        detail: p.type,
        accent: battle.accent,
        iconStyle: battle.iconStyle,
        crestSeed: p.id, // reuses the exact same crest texture as the real dungeon encounter
        isBattle: true,
      })
    })

    beats.push({
      title: 'Certifications',
      subtitle: PROFILE.certifications.map((c) => `${c.name} (${c.issuer})`).join('  \u00b7  '),
      accent: THEME.emberGold,
      iconStyle: 'book',
      crestSeed: 'speedrun-certs',
      isBattle: false,
    })

    beats.push({
      title: 'Run Complete',
      subtitle: 'Loading full résumé...',
      accent: THEME.parchment,
      iconStyle: 'book',
      crestSeed: 'speedrun-end',
      isBattle: false,
    })

    return beats
  }

  private showBeat(i: number) {
    this.advancing = false
    this.beatGroup?.destroy()
    this.beatTimer?.destroy()

    const beat = this.beats[i]
    const isLast = i === this.beats.length - 1
    const crestKey = generateCrestTexture(this, beat.crestSeed, beat.accent, beat.iconStyle)

    const group = this.add.container(0, 0)
    this.beatGroup = group

    const crest = this.add.image(GAME_WIDTH / 2, 108, crestKey).setDisplaySize(beat.big ? 88 : 66, beat.big ? 88 : 66).setAlpha(0).setScale(0.6)
    group.add(crest)
    this.tweens.add({ targets: crest, alpha: 1, scale: 1, duration: 220, ease: 'Back.Out' })

    const title = this.add
      .text(GAME_WIDTH / 2, 168, beat.title, { fontFamily: FONT_DISPLAY, fontSize: beat.big ? '15px' : '12px', color: THEME.parchment, align: 'center', wordWrap: { width: GAME_WIDTH - 60 } })
      .setOrigin(0.5)
      .setAlpha(0)
    group.add(title)
    this.tweens.add({ targets: title, alpha: 1, duration: 250, delay: 100 })

    if (beat.detail) {
      const detail = this.add
        .text(GAME_WIDTH / 2, 190, beat.detail, { fontFamily: FONT_BODY, fontSize: '13px', color: THEME.steelGrey })
        .setOrigin(0.5)
        .setAlpha(0)
      group.add(detail)
      this.tweens.add({ targets: detail, alpha: 1, duration: 250, delay: 150 })
    }

    const progress = this.add
      .text(GAME_WIDTH - 12, 12, `${i + 1} / ${this.beats.length}`, { fontFamily: FONT_BODY, fontSize: '13px', color: THEME.steelGrey })
      .setOrigin(1, 0)
    group.add(progress)

    // Reading time scales with how much text is actually on screen, instead
    // of a flat duration — a one-line title and a full résumé bullet
    // shouldn't get the same amount of time.
    const CHAR_MS = 40
    const BASE_MS = 700
    const MIN_MS = 1400
    const MAX_MS = 5500
    const textLength = beat.title.length + beat.subtitle.length + (beat.detail?.length ?? 0)
    let holdMs = Phaser.Math.Clamp(BASE_MS + textLength * CHAR_MS, MIN_MS, MAX_MS)

    let subtitleDelay = 250

    if (beat.isBattle) {
      const barY = 138
      this.add.rectangle(GAME_WIDTH / 2, barY, 124, 10, hexToNum(THEME.inkNavy)).setStrokeStyle(2, hexToNum(THEME.parchment))
      const fill = this.add.rectangle(GAME_WIDTH / 2 - 60, barY, 120, 6, hexToNum(THEME.signalRed)).setOrigin(0, 0.5)
      group.add(fill)
      this.time.delayedCall(320, () => {
        this.tweens.add({ targets: fill, width: 0, duration: 480, ease: 'Sine.easeIn' })
        this.cameras.main.shake(300, 0.003)
      })
      const stamp = this.add
        .text(GAME_WIDTH / 2, 138, 'CLEARED', { fontFamily: FONT_DISPLAY, fontSize: '11px', color: THEME.mossGreen })
        .setOrigin(0.5)
        .setAlpha(0)
        .setScale(0.5)
      group.add(stamp)
      this.time.delayedCall(820, () => {
        this.tweens.add({ targets: stamp, alpha: 1, scale: 1, duration: 160, ease: 'Back.Out' })
      })
      subtitleDelay = 900
      holdMs += 500 // extra room for the battle flourish before the subtitle even lands
    }

    const subtitle = this.add
      .text(GAME_WIDTH / 2, 220, beat.subtitle, {
        fontFamily: FONT_BODY,
        fontSize: '14px',
        color: THEME.parchment,
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 70 },
        lineSpacing: 3,
      })
      .setOrigin(0.5, 0)
      .setAlpha(0)
    group.add(subtitle)
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 300, delay: subtitleDelay })

    this.beatTimer = this.time.delayedCall(holdMs, () => (isLast ? this.finish() : this.advance()))
  }

  private advance() {
    if (this.index + 1 < this.beats.length) {
      this.index += 1
      this.showBeat(this.index)
    } else {
      this.finish()
    }
  }

  private skipBeat() {
    if (this.advancing) return
    this.advancing = true
    this.advance()
  }

  private finish() {
    this.beatTimer?.destroy()
    this.cameras.main.fadeOut(350, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('MainMenu')
      window.dispatchEvent(new CustomEvent('open-trainer-card'))
    })
  }
}
