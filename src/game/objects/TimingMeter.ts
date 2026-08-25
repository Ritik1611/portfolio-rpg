import Phaser from 'phaser'
import { THEME, FONT_BODY } from '../config'
import { hexToNum } from './DialogueBox'

export type TimingQuality = 'perfect' | 'good' | 'miss'

export interface TimingResult {
  quality: TimingQuality
  multiplier: number
}

export interface TimingZones {
  /** 0..1 range across the bar where a "good" hit registers. */
  sweetStart: number
  sweetEnd: number
  /** 0..1 range (sits inside the sweet range) for a "perfect" hit. */
  perfectStart: number
  perfectEnd: number
  /** Milliseconds for one full sweep (0→1). The marker ping-pongs. */
  speedMs: number
  perfectMultiplier: number
  goodMultiplier: number
  missMultiplier: number
  /** Total time before the window auto-resolves as a miss. */
  timeoutMs?: number
  label?: string
}

const DEFAULT_ZONES: TimingZones = {
  sweetStart: 0.55,
  sweetEnd: 0.88,
  perfectStart: 0.68,
  perfectEnd: 0.8,
  speedMs: 900,
  perfectMultiplier: 1.6,
  goodMultiplier: 1.1,
  missMultiplier: 0.55,
  timeoutMs: 1700,
  label: 'Press ENTER!',
}

/**
 * A horizontal bar with a sweeping marker. Press ENTER/SPACE (or tap) when the
 * marker is inside the highlighted zone. Calls onResolve exactly once.
 */
export class TimingMeter {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private marker: Phaser.GameObjects.Rectangle
  private zones: TimingZones
  private value = 0
  private width: number
  private tween?: Phaser.Tweens.Tween
  private timeoutEvent?: Phaser.Time.TimerEvent
  private resolved = false
  private onKey: () => void
  private onPointer: () => void
  private onResolve: (result: TimingResult) => void

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, onResolve: (result: TimingResult) => void, zones: Partial<TimingZones> = {}) {
    this.scene = scene
    this.zones = { ...DEFAULT_ZONES, ...zones }
    this.width = width
    this.onResolve = onResolve

    const height = 14
    const track = scene.add.rectangle(0, 0, width, height, hexToNum(THEME.inkNavy)).setStrokeStyle(2, hexToNum(THEME.parchment))

    const sweetZone = scene.add.rectangle(
      -width / 2 + ((this.zones.sweetStart + this.zones.sweetEnd) / 2) * width,
      0,
      (this.zones.sweetEnd - this.zones.sweetStart) * width,
      height - 4,
      hexToNum(THEME.mossGreen),
      0.55,
    )
    const perfectZone = scene.add.rectangle(
      -width / 2 + ((this.zones.perfectStart + this.zones.perfectEnd) / 2) * width,
      0,
      (this.zones.perfectEnd - this.zones.perfectStart) * width,
      height - 4,
      hexToNum(THEME.emberGold),
      0.85,
    )

    this.marker = scene.add.rectangle(-width / 2, 0, 4, height + 8, hexToNum(THEME.signalRed))

    const label = scene.add
      .text(0, -18, this.zones.label ?? 'Press ENTER!', { fontFamily: FONT_BODY, fontSize: '15px', color: THEME.parchment })
      .setOrigin(0.5)

    this.container = scene.add.container(x, y, [track, sweetZone, perfectZone, this.marker, label])
    this.container.setDepth(3500)

    this.tween = scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: this.zones.speedMs,
      yoyo: true,
      repeat: -1,
      ease: 'Linear',
      onUpdate: (tw) => {
        this.value = tw.getValue() ?? this.value
        this.marker.x = -this.width / 2 + this.value * this.width
      },
    })

    this.onKey = () => this.resolve(false)
    this.onPointer = () => this.resolve(false)
    scene.input.keyboard?.once('keydown-ENTER', this.onKey)
    scene.input.keyboard?.once('keydown-SPACE', this.onKey)
    scene.input.once('pointerdown', this.onPointer)

    this.timeoutEvent = scene.time.delayedCall(this.zones.timeoutMs ?? 1700, () => this.resolve(true))
  }

  private resolve(timedOut: boolean) {
    if (this.resolved) return
    this.resolved = true

    this.tween?.stop()
    this.timeoutEvent?.destroy()
    this.scene.input.keyboard?.off('keydown-ENTER', this.onKey)
    this.scene.input.keyboard?.off('keydown-SPACE', this.onKey)
    this.scene.input.off('pointerdown', this.onPointer)

    let quality: TimingQuality = 'miss'
    if (!timedOut) {
      const v = this.value
      if (v >= this.zones.perfectStart && v <= this.zones.perfectEnd) quality = 'perfect'
      else if (v >= this.zones.sweetStart && v <= this.zones.sweetEnd) quality = 'good'
    }

    const multiplier =
      quality === 'perfect' ? this.zones.perfectMultiplier : quality === 'good' ? this.zones.goodMultiplier : this.zones.missMultiplier

    this.container.destroy()
    this.onResolve({ quality, multiplier })
  }
}
