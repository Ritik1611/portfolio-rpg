import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, THEME, FONT_DISPLAY, FONT_BODY } from '../config'
import { hexToNum } from '../objects/DialogueBox'
import { ChoiceMenu } from '../objects/ChoiceMenu'
import { TimingMeter } from '../objects/TimingMeter'
import type { TimingQuality } from '../objects/TimingMeter'
import { generateCrestTexture } from '../gfx/battleArt'
import { generateActorTexture, idleFrame } from '../gfx/pixelActor'
import { PALETTES } from '../data/npcs'
import type { BattleConfig, BattleMove, BattleType } from '../data/battles'

const BAR_W = 150

function computeMoveDamage(move: BattleMove, timingMultiplier: number, weakness?: BattleType, resist?: BattleType) {
  let dmg = Phaser.Math.Between(move.min, move.max)
  let effectiveness: 'weak' | 'resist' | 'neutral' = 'neutral'
  if (weakness && move.type === weakness) {
    dmg = Math.round(dmg * 1.5)
    effectiveness = 'weak'
  } else if (resist && move.type === resist) {
    dmg = Math.round(dmg * 0.6)
    effectiveness = 'resist'
  }
  const crit = Math.random() < 0.1
  if (crit) dmg = Math.round(dmg * 1.4)
  dmg = Math.max(1, Math.round(dmg * timingMultiplier))
  return { dmg, crit, effectiveness }
}

export interface BattleSceneData {
  config: BattleConfig
  playerName: string
  onComplete: (won: boolean) => void
}

export class BattleScene extends Phaser.Scene {
  private config!: BattleConfig
  private playerName = 'You'
  private onComplete!: (won: boolean) => void

  private playerHP = 100
  private playerMaxHP = 100
  private bossHP = 0
  private bossMaxHP = 0
  private ended = false

  private messageText!: Phaser.GameObjects.Text
  private playerBarFill!: Phaser.GameObjects.Rectangle
  private bossBarFill!: Phaser.GameObjects.Rectangle
  private playerHPLabel!: Phaser.GameObjects.Text
  private bossHPLabel!: Phaser.GameObjects.Text
  private bossCrest!: Phaser.GameObjects.Image
  private playerSprite!: Phaser.GameObjects.Sprite
  private activeMenu?: ChoiceMenu
  private tutorialAttackShown = false
  private tutorialDefendShown = false

  constructor() {
    super({ key: 'Battle' })
  }

  init(data: BattleSceneData) {
    this.config = data.config
    this.playerName = data.playerName || 'You'
    this.onComplete = data.onComplete
    this.playerHP = this.playerMaxHP
    this.bossHP = this.config.bossHP
    this.bossMaxHP = this.config.bossHP
    this.ended = false
  }

  create() {
    generateActorTexture(this, 'player', PALETTES.player)
    const crestKey = generateCrestTexture(this, this.config.id, this.config.accent, this.config.iconStyle)

    // arena
    this.add.rectangle(GAME_WIDTH / 2, 108, GAME_WIDTH, 216, hexToNum(THEME.twilightPurple))
    this.add.rectangle(GAME_WIDTH / 2, 216, GAME_WIDTH, 8, hexToNum(THEME.inkNavy))
    this.add.ellipse(360, 150, 110, 26, hexToNum(THEME.inkNavy), 0.35)
    this.add.ellipse(95, 196, 120, 28, hexToNum(THEME.inkNavy), 0.35)

    // boss
    this.add
      .text(226, 20, this.config.bossName.toUpperCase(), { fontFamily: FONT_DISPLAY, fontSize: '10px', color: THEME.parchment })
      .setOrigin(0, 0.5)
    this.add
      .text(226, 34, this.config.bossSubtitle, { fontFamily: FONT_BODY, fontSize: '13px', color: THEME.steelGrey })
      .setOrigin(0, 0.5)
    this.add.rectangle(226, 48, BAR_W + 4, 12, hexToNum(THEME.inkNavy)).setOrigin(0, 0.5).setStrokeStyle(2, hexToNum(THEME.parchment))
    this.bossBarFill = this.add.rectangle(228, 48, BAR_W, 8, hexToNum(THEME.signalRed)).setOrigin(0, 0.5)
    this.bossHPLabel = this.add
      .text(226, 62, `${this.bossHP}/${this.bossMaxHP}`, { fontFamily: FONT_BODY, fontSize: '12px', color: THEME.parchment })
      .setOrigin(0, 0.5)

    this.bossCrest = this.add.image(360, 118, crestKey).setDisplaySize(60, 60)
    if (this.config.legendary) {
      this.bossCrest.setDisplaySize(78, 78)
      this.add.circle(360, 118, 44).setStrokeStyle(3, hexToNum(THEME.emberGold)).setFillStyle(0, 0)
      this.cameras.main.flash(300, 255, 255, 255, false)
    }

    // player
    this.playerSprite = this.add.sprite(95, 178, 'player', idleFrame('up')).setScale(2.6)
    this.add
      .text(16, 148, this.playerName.toUpperCase(), { fontFamily: FONT_DISPLAY, fontSize: '10px', color: THEME.parchment })
      .setOrigin(0, 0.5)
    this.add.rectangle(16, 164, BAR_W + 4, 12, hexToNum(THEME.inkNavy)).setOrigin(0, 0.5).setStrokeStyle(2, hexToNum(THEME.parchment))
    this.playerBarFill = this.add.rectangle(18, 164, BAR_W, 8, hexToNum(THEME.mossGreen)).setOrigin(0, 0.5)
    this.playerHPLabel = this.add
      .text(16, 178, `${this.playerHP}/${this.playerMaxHP}`, { fontFamily: FONT_BODY, fontSize: '12px', color: THEME.parchment })
      .setOrigin(0, 0.5)

    // message panel
    const panelY = 216
    this.add
      .rectangle(GAME_WIDTH / 2, panelY + (GAME_HEIGHT - panelY) / 2, GAME_WIDTH, GAME_HEIGHT - panelY, hexToNum(THEME.parchment))
      .setStrokeStyle(3, hexToNum(THEME.steelGrey))
    this.messageText = this.add.text(16, panelY + 12, '', {
      fontFamily: FONT_BODY,
      fontSize: '18px',
      color: THEME.inkNavy,
      wordWrap: { width: GAME_WIDTH - 32 },
      lineSpacing: 3,
    })

    this.add
      .text(GAME_WIDTH - 8, GAME_HEIGHT - 6, 'Esc to leave', { fontFamily: FONT_BODY, fontSize: '11px', color: THEME.steelGrey })
      .setOrigin(1, 1)
      .setAlpha(0.8)

    this.input.keyboard?.on('keydown-ESC', () => this.flee())

    const opening =
      this.config.kind === 'wild'
        ? `A wild ${this.config.bossName} appears!`
        : this.config.legendary
          ? `A powerful presence stirs... ${this.config.bossName}!`
          : `${this.config.bossSubtitle} \u2014 challenge accepted!`
    this.queueMessage(opening, () => this.playerTurn(), this.config.legendary ? 1500 : 1000)
  }

  private queueMessage(text: string, after: () => void, holdMs = 900) {
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

  private playerTurn() {
    if (this.ended) return
    if (this.config.tutorial && !this.tutorialAttackShown) {
      this.tutorialAttackShown = true
      this.queueMessage('Bottom-left is your Focus. Top-right is theirs.', () => {
        this.queueMessage('Pick a move, then time your ENTER press in the bar\nthat pops up. Gold zone is best.', () => this.showMoveMenu(), 1600)
      }, 1700)
      return
    }
    this.queueMessage('What will you do?', () => this.showMoveMenu(), 350)
  }

  private showMoveMenu() {
    if (this.ended) return
    const options = [...this.config.moves.map((m) => m.name), 'Leave Battle']
    this.activeMenu = new ChoiceMenu(this, {
      x: 30,
      y: 250,
      options,
      spacing: 19,
      fontSize: '15px',
      onSelect: (i) => {
        this.activeMenu = undefined
        if (i === this.config.moves.length) {
          this.flee()
          return
        }
        this.useMove(this.config.moves[i])
      },
    })
  }

  // ── attack: pick a move, then land it with a timing meter ────
  private useMove(move: BattleMove) {
    this.queueMessage(`You used ${move.name} \u2014 it ${move.flavor}.`, () => {
      this.messageText.setText('Time your strike!')
      new TimingMeter(
        this,
        GAME_WIDTH / 2,
        198,
        200,
        (result) => this.resolveAttack(move, result.quality, result.multiplier),
        this.config.tutorial
          ? { sweetStart: 0.4, sweetEnd: 0.95, perfectStart: 0.55, perfectEnd: 0.85, speedMs: 1300, label: 'ENTER to strike' }
          : { label: 'ENTER to strike' },
      )
    }, 500)
  }

  private resolveAttack(move: BattleMove, quality: TimingQuality, multiplier: number) {
    const { dmg, crit, effectiveness } = computeMoveDamage(move, multiplier, this.config.weakness, this.config.resist)
    this.bossHP = Math.max(0, this.bossHP - dmg)
    this.tweenBar(this.bossBarFill, this.bossHP, this.bossMaxHP)
    this.bossHPLabel.setText(`${this.bossHP}/${this.bossMaxHP}`)
    this.impact(this.bossCrest, quality === 'miss' ? 0.4 : quality === 'good' ? 0.75 : 1)
    this.floatDamage(360, 90, dmg, crit || quality === 'perfect')
    this.showQuality(quality, GAME_WIDTH / 2, 176)

    const bits: string[] = []
    if (quality === 'perfect') bits.push('Perfect timing!')
    else if (quality === 'miss') bits.push('Mistimed \u2014 weak hit.')
    if (crit) bits.push('Critical hit!')
    if (effectiveness === 'weak') bits.push('Super effective!')
    else if (effectiveness === 'resist') bits.push('Not very effective...')

    this.queueMessage(`${dmg} impact. ${bits.join(' ')}`.trim(), () => {
      if (move.heal) {
        this.playerHP = Math.min(this.playerMaxHP, this.playerHP + move.heal)
        this.tweenBar(this.playerBarFill, this.playerHP, this.playerMaxHP)
        this.playerHPLabel.setText(`${this.playerHP}/${this.playerMaxHP}`)
      }
      if (this.bossHP <= 0) {
        this.victory()
      } else {
        this.bossTurn()
      }
    }, 750)
  }

  // ── defend: brace against the boss's attack with a faster meter ─
  private bossTurn() {
    if (this.ended) return
    const atk = this.config.bossAttacks[Phaser.Math.Between(0, this.config.bossAttacks.length - 1)]
    this.queueMessage(`${this.config.bossName} uses ${atk.name} \u2014 ${atk.flavor}.`, () => {
      if (this.config.tutorial && !this.tutorialDefendShown) {
        this.tutorialDefendShown = true
        this.queueMessage('Now brace yourself \u2014 same idea, just defending.\nGood timing blocks most of the hit.', () => this.showBraceMeter(atk), 1700)
        return
      }
      this.showBraceMeter(atk)
    }, 500)
  }

  private showBraceMeter(atk: { name: string; min: number; max: number }) {
    this.messageText.setText('Brace for it!')
    new TimingMeter(
      this,
      GAME_WIDTH / 2,
      198,
      180,
      (result) => this.resolveDefend(atk, result.quality),
      this.config.tutorial
        ? { sweetStart: 0.35, sweetEnd: 0.95, perfectStart: 0.5, perfectEnd: 0.85, speedMs: 950, label: 'ENTER to brace' }
        : { speedMs: 620, sweetStart: 0.5, sweetEnd: 0.9, perfectStart: 0.62, perfectEnd: 0.78, label: 'ENTER to brace' },
    )
  }

  private resolveDefend(atk: { name: string; min: number; max: number }, quality: TimingQuality) {
    const guardMultiplier = quality === 'perfect' ? 0.4 : quality === 'good' ? 0.7 : 1
    const crit = Math.random() < 0.06 && quality === 'miss'
    let dmg = Phaser.Math.Between(atk.min, atk.max)
    if (crit) dmg = Math.round(dmg * 1.4)
    dmg = Math.max(1, Math.round(dmg * guardMultiplier))

    this.playerHP = Math.max(0, this.playerHP - dmg)
    this.tweenBar(this.playerBarFill, this.playerHP, this.playerMaxHP)
    this.playerHPLabel.setText(`${this.playerHP}/${this.playerMaxHP}`)
    this.impact(this.playerSprite, quality === 'miss' ? 1 : 0.5)
    this.floatDamage(95, 150, dmg, crit)
    this.showQuality(quality, 95, 128, quality === 'perfect' ? 'BRACED!' : quality === 'good' ? 'BLOCKED' : undefined)

    const suffix =
      quality === 'perfect' ? ' Braced well \u2014 barely felt it.' : quality === 'good' ? ' Partially blocked.' : crit ? ' Ouch, critical!' : ''
    this.queueMessage(`${dmg} damage taken.${suffix}`, () => {
      if (this.playerHP <= 0) {
        this.playerHP = this.playerMaxHP
        this.tweenBar(this.playerBarFill, this.playerHP, this.playerMaxHP)
        this.playerHPLabel.setText(`${this.playerHP}/${this.playerMaxHP}`)
        this.queueMessage('Need a breather... focus restored.', () => this.playerTurn(), 800)
      } else {
        this.playerTurn()
      }
    }, 750)
  }

  private victory() {
    if (this.ended) return
    this.ended = true
    this.queueMessage(`${this.config.bossName} is resolved!`, () => {
      this.onComplete(true)
      this.scene.stop()
    }, 1100)
  }

  private flee() {
    if (this.ended) return
    this.ended = true
    this.activeMenu?.destroy()
    this.onComplete(false)
    this.scene.stop()
  }

  // ── feedback / juice ─────────────────────────────────────────
  private showQuality(quality: TimingQuality, x: number, y: number, overrideText?: string) {
    const text = overrideText ?? (quality === 'perfect' ? 'PERFECT!' : quality === 'good' ? 'GOOD' : 'MISTIMED')
    const color = quality === 'perfect' ? THEME.emberGold : quality === 'good' ? THEME.mossGreen : THEME.steelGrey
    const t = this.add
      .text(x, y, text, { fontFamily: FONT_DISPLAY, fontSize: quality === 'perfect' ? '13px' : '10px', color })
      .setOrigin(0.5)
      .setDepth(3600)
      .setScale(0.6)
    this.tweens.add({
      targets: t,
      scale: 1,
      duration: 140,
      ease: 'Back.Out',
      onComplete: () => {
        this.tweens.add({ targets: t, alpha: 0, y: y - 16, duration: 500, delay: 300, onComplete: () => t.destroy() })
      },
    })
    if (quality === 'perfect') {
      this.cameras.main.flash(120, 255, 205, 117, false)
    }
  }

  private impact(target: Phaser.GameObjects.GameObject, strength = 1) {
    this.cameras.main.shake(Math.round(140 * strength), 0.006 * strength)
    this.tweens.add({
      targets: target,
      x: (target as any).x + 4 * strength,
      duration: 40,
      yoyo: true,
      repeat: 3,
    })
  }

  private floatDamage(x: number, y: number, dmg: number, crit: boolean) {
    const t = this.add
      .text(x, y, `-${dmg}`, {
        fontFamily: FONT_DISPLAY,
        fontSize: crit ? '15px' : '11px',
        color: crit ? THEME.emberGold : THEME.signalRed,
      })
      .setOrigin(0.5)
      .setDepth(3000)
    this.tweens.add({ targets: t, y: y - 28, alpha: 0, duration: 650, onComplete: () => t.destroy() })
  }

  private tweenBar(bar: Phaser.GameObjects.Rectangle, value: number, max: number) {
    const targetWidth = Math.max(0, (value / max) * BAR_W)
    this.tweens.add({ targets: bar, width: targetWidth, duration: 300, ease: 'Sine.easeOut' })
  }
}
