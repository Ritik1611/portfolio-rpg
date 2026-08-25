import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, THEME, FONT_DISPLAY, FONT_BODY, writeSave, levelUpSkill } from '../config'
import type { SaveData } from '../config'
import { DialogueBox } from '../objects/DialogueBox'
import { ChoiceMenu } from '../objects/ChoiceMenu'
import { showAchievement, showLevelUp, showClueFound, showWildAlert } from '../objects/AchievementToast'
import { generateTileset, generateSignTexture, generateGateTexture, TILE, TILESET_KEY, TILE_SIZE, BLOCKING_TILES, SIGN_KEY, GATE_KEY } from '../gfx/tileset'
import { buildMapData, TILE_COLS, TILE_ROWS } from '../gfx/mapBuilder'
import { generateActorTexture, generatePortraitTexture, idleFrame } from '../gfx/pixelActor'
import type { Direction, ActorPalette } from '../gfx/pixelActor'
import { generateCrestTexture } from '../gfx/battleArt'
import { generatePortalTexture } from '../gfx/portalArt'
import { promptCodeEntry } from '../objects/CodeEntry'
import type { CodeEntryHandle } from '../objects/CodeEntry'
import { PALETTES, NPCS, BYTE, GYM_LEADERS, EXAM_GATES, PROJECT_MARKERS, HOUSE_DOORS, CLUE_HINTS } from '../data/npcs'
import type { ProjectMarker, ExamGateNPC } from '../data/npcs'
import { KAVI_PRACTICE, generateWildBugConfig, findGym, findExam, findProject } from '../data/battles'
import type { BattleConfig } from '../data/battles'
import { CHRONO_DUNGEON, ATTEND_DUNGEON } from '../data/dungeons'
import type { DungeonConfig } from '../data/dungeons'
import { useUIStore } from '../../store/gameStore'

const SPEED = 100
const INTERACT_RADIUS = 30
const ENCOUNTER_COOLDOWN = 7000
const ENCOUNTER_CHANCE = 0.06

export class VillageScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private dialogueBox!: DialogueBox
  private facing: Direction = 'down'
  private uiLocked = false
  private activeTargetId: string | null = null
  private interactHint!: Phaser.GameObjects.Text
  private exclaimMarks = new Map<string, Phaser.GameObjects.Text>()
  private visitCounts = new Map<string, number>()
  private lastDustAt = 0
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key }
  private mapGrid!: number[][]
  private lastTileX = -1
  private lastTileY = -1
  private lastEncounterAt = 0
  private debugPointsText!: Phaser.GameObjects.Text
  private gateBarriers = new Map<string, Phaser.Physics.Arcade.Sprite>()

  constructor() {
    super({ key: 'Village' })
  }

  create() {
    const save = this.registry.get('save') as SaveData
    this.uiLocked = false
    this.visitCounts.clear()
    useUIStore.getState().updateSaveSnapshot(save)

    this.cameras.main.setBackgroundColor(THEME.inkNavy)
    this.cameras.main.fadeIn(350)

    generateTileset(this)
    generateSignTexture(this)
    generateGateTexture(this)

    const { grid: mapData } = buildMapData()
    this.mapGrid = mapData
    const map = this.make.tilemap({ data: mapData, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE })
    const tileset = map.addTilesetImage(TILESET_KEY, TILESET_KEY, TILE_SIZE, TILE_SIZE, 0, 0)!
    const layer = map.createLayer(0, tileset, 0, 0)!
    layer.setCollision(BLOCKING_TILES as unknown as number[])
    layer.setDepth(0)

    const worldW = TILE_COLS * TILE_SIZE
    const worldH = TILE_ROWS * TILE_SIZE
    this.physics.world.setBounds(0, 0, worldW, worldH)
    this.cameras.main.setBounds(0, 0, worldW, worldH)

    // player
    generateActorTexture(this, 'player', PALETTES.player)
    const spawnX = 6 * TILE_SIZE + 8
    const spawnY = 15 * TILE_SIZE + 8
    this.player = this.physics.add.sprite(spawnX, spawnY, 'player', 0)
    this.player.body!.setSize(12, 10).setOffset(2, 14)
    this.player.setCollideWorldBounds(true)
    this.physics.add.collider(this.player, layer)

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)

    // static NPCs (Mom, Kavi, signs)
    NPCS.forEach((npc) => {
      if (npc.kind === 'actor') {
        this.spawnCharacter(npc.id, npc.x, npc.y, npc.palette, npc.facing, npc.name)
      } else {
        const spr = this.physics.add.staticSprite(npc.x, npc.y, SIGN_KEY)
        spr.setDepth(npc.y)
        this.physics.add.collider(this.player, spr)
      }
    })

    // professor byte
    this.spawnCharacter(BYTE.id, BYTE.x, BYTE.y, BYTE.palette, BYTE.facing, BYTE.name)

    // gym leaders (internship battles) + exam gates (SSC/HSC)
    GYM_LEADERS.forEach((g) => this.spawnCharacter(g.id, g.x, g.y, g.palette, g.facing, g.name, g.battleId))
    EXAM_GATES.forEach((g) => {
      this.spawnCharacter(g.id, g.x, g.y, g.palette, g.facing, g.name)
      const alreadyOpen = save.gatesOpen.includes(g.id) || save.badges.includes(g.battleId)
      if (!alreadyOpen) {
        const barrier = this.physics.add.staticSprite(g.barrierX, g.barrierY, GATE_KEY)
        barrier.setDepth(g.barrierY + 1)
        this.physics.add.collider(this.player, barrier)
        this.gateBarriers.set(g.id, barrier)
      }
    })

    // project encounter markers
    PROJECT_MARKERS.forEach((m) => this.spawnProjectMarker(m))

    // enterable house doors
    HOUSE_DOORS.forEach((d) => {
      this.add
        .text(d.x, d.y - 20, '\u2302', { fontFamily: FONT_DISPLAY, fontSize: '12px', color: THEME.emberGold })
        .setOrigin(0.5)
        .setDepth(2000)
    })

    // dialogue box + interaction hint
    this.dialogueBox = new DialogueBox(this)
    this.interactHint = this.add
      .text(0, 0, '▲ ENTER', { fontFamily: FONT_BODY, fontSize: '14px', color: THEME.emberGold })
      .setOrigin(0.5)
      .setDepth(2000)
      .setVisible(false)

    // title card
    this.showTitleCard('HARMONY VILLAGE')

    // HUD
    this.add
      .text(GAME_WIDTH - 8, GAME_HEIGHT - 8, '\u2191\u2193\u2190\u2192 Move   Enter Talk   T Journal   Esc Menu', {
        fontFamily: FONT_BODY,
        fontSize: '12px',
        color: THEME.steelGrey,
      })
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(999)
      .setAlpha(0.85)

    this.debugPointsText = this.add
      .text(8, 8, `\u1D9C Bugs Squashed: ${save.debugPoints}`, { fontFamily: FONT_BODY, fontSize: '13px', color: THEME.steelGrey })
      .setScrollFactor(0)
      .setDepth(999)
      .setAlpha(0.9)

    this.createButterflies()

    // input
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.uiLocked || !this.activeTargetId) return
      this.startInteraction(this.activeTargetId)
    })

    this.input.keyboard?.on('keydown-T', () => {
      if (this.uiLocked) return
      window.dispatchEvent(new CustomEvent('open-trainer-card'))
    })

    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.uiLocked) return
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('MainMenu'))
    })
  }

  update() {
    if (!this.player.body) return

    if (this.uiLocked) {
      this.player.setVelocity(0, 0)
      return
    }

    let vx = 0
    let vy = 0
    let dir: Direction | null = null

    if (this.cursors.left?.isDown || this.wasd.A.isDown) {
      vx = -SPEED
      dir = 'left'
    } else if (this.cursors.right?.isDown || this.wasd.D.isDown) {
      vx = SPEED
      dir = 'right'
    }
    if (this.cursors.up?.isDown || this.wasd.W.isDown) {
      vy = -SPEED
      dir = 'up'
    } else if (this.cursors.down?.isDown || this.wasd.S.isDown) {
      vy = SPEED
      dir = 'down'
    }

    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2
      vy *= Math.SQRT1_2
    }

    this.player.setVelocity(vx, vy)
    this.player.setDepth(this.player.y)

    if (vx !== 0 || vy !== 0) {
      if (dir) {
        this.facing = dir
        this.player.anims.play(`player-walk-${dir}`, true)
      }
      if (this.time.now - this.lastDustAt > 260) {
        this.lastDustAt = this.time.now
        const dust = this.add
          .circle(this.player.x, this.player.y + 11, 2.5, 0xffffff, 0.45)
          .setDepth(this.player.depth - 1)
        this.tweens.add({
          targets: dust,
          alpha: 0,
          scale: 1.8,
          duration: 320,
          onComplete: () => dust.destroy(),
        })
      }
    } else {
      this.player.anims.stop()
      this.player.setFrame(idleFrame(this.facing))
    }

    this.updateInteractionTarget()
    this.checkWildEncounter()
  }

  // ── character spawning ──────────────────────────────────────
  private spawnCharacter(
    id: string,
    x: number,
    y: number,
    palette: ActorPalette,
    facing: Direction,
    displayName: string,
    badgeId?: string,
  ): Phaser.Physics.Arcade.Sprite {
    generateActorTexture(this, id, palette)
    generatePortraitTexture(this, id, palette)
    const spr = this.physics.add.sprite(x, y, id, idleFrame(facing))
    spr.setImmovable(true)
    spr.body!.setSize(12, 10).setOffset(2, 14)
    ;(spr.body as Phaser.Physics.Arcade.Body).moves = false
    spr.setDepth(y)
    this.physics.add.collider(this.player, spr)
    this.tweens.add({
      targets: spr,
      y: y - 2,
      duration: 900 + Phaser.Math.Between(0, 200),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.add
      .text(x, y - 18, displayName, { fontFamily: FONT_BODY, fontSize: '12px', color: THEME.parchment })
      .setOrigin(0.5)
      .setDepth(y + 1)
      .setStroke('#1a1c2c', 3)

    if (badgeId) {
      const save = this.registry.get('save') as SaveData
      if (!save.badges.includes(badgeId)) {
        const mark = this.add
          .text(x, y - 24, '!', { fontFamily: FONT_DISPLAY, fontSize: '14px', color: THEME.emberGold })
          .setOrigin(0.5)
          .setDepth(2000)
        this.tweens.add({ targets: mark, y: '+=4', duration: 400, yoyo: true, repeat: -1 })
        this.exclaimMarks.set(badgeId, mark)
      }
    }
    return spr
  }

  private clearExclaim(id: string) {
    this.exclaimMarks.get(id)?.destroy()
    this.exclaimMarks.delete(id)
  }

  private spawnProjectMarker(marker: ProjectMarker) {
    const project = findProject(marker.id)

    if (marker.kind === 'portal') {
      const portalKey = generatePortalTexture(this, project.accent)
      const img = this.add.image(marker.x, marker.y, portalKey).setDisplaySize(44, 44).setDepth(marker.y)
      this.tweens.add({ targets: img, angle: 360, duration: 4000, repeat: -1, ease: 'Linear' })
      this.tweens.add({ targets: img, scale: 1.08, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

      const save = this.registry.get('save') as SaveData
      if (!save.projectsFound.includes(marker.id)) {
        const mark = this.add
          .text(marker.x, marker.y - 34, '?', { fontFamily: FONT_DISPLAY, fontSize: '14px', color: THEME.emberGold })
          .setOrigin(0.5)
          .setDepth(2000)
        this.tweens.add({ targets: mark, y: '+=4', duration: 400, yoyo: true, repeat: -1 })
        this.exclaimMarks.set(marker.id, mark)
      }
      return
    }

    const crestKey = generateCrestTexture(this, marker.id, project.accent, project.iconStyle)
    const img = this.add.image(marker.x, marker.y, crestKey).setDisplaySize(32, 32).setDepth(marker.y)
    this.tweens.add({
      targets: img,
      y: marker.y - 4,
      duration: 1100 + Phaser.Math.Between(0, 300),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    const save = this.registry.get('save') as SaveData
    if (!save.projectsFound.includes(marker.id)) {
      const mark = this.add
        .text(marker.x, marker.y - 28, '?', { fontFamily: FONT_DISPLAY, fontSize: '14px', color: THEME.emberGold })
        .setOrigin(0.5)
        .setDepth(2000)
      this.tweens.add({ targets: mark, y: '+=4', duration: 400, yoyo: true, repeat: -1 })
      this.exclaimMarks.set(marker.id, mark)
    }
  }

  // ── wild encounters ─────────────────────────────────────────
  private checkWildEncounter() {
    const tx = Math.floor(this.player.x / TILE_SIZE)
    const ty = Math.floor(this.player.y / TILE_SIZE)
    if (tx === this.lastTileX && ty === this.lastTileY) return
    this.lastTileX = tx
    this.lastTileY = ty

    if (this.time.now - this.lastEncounterAt < ENCOUNTER_COOLDOWN) return
    if (this.mapGrid[ty]?.[tx] !== TILE.FLOWER) return
    if (Math.random() >= ENCOUNTER_CHANCE) return

    this.lastEncounterAt = this.time.now
    this.uiLocked = true
    this.player.setVelocity(0, 0)
    this.interactHint.setVisible(false)
    showWildAlert(this)
    this.cameras.main.shake(180, 0.006)
    this.time.delayedCall(750, () => this.launchBattle(generateWildBugConfig()))
  }

  // ── title card ───────────────────────────────────────────────
  private showTitleCard(text: string) {
    const title = this.add
      .text(GAME_WIDTH / 2, 34, text, { fontFamily: FONT_DISPLAY, fontSize: '13px', color: THEME.parchment })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000)
      .setAlpha(0)
    this.tweens.add({ targets: title, alpha: 1, duration: 400, yoyo: true, hold: 1400, onComplete: () => title.destroy() })
  }

  // ── interaction targeting ───────────────────────────────────
  private updateInteractionTarget() {
    const targets: { id: string; x: number; y: number }[] = [
      { id: BYTE.id, x: BYTE.x, y: BYTE.y },
      ...NPCS.map((n) => ({ id: n.id, x: n.x, y: n.y })),
      ...GYM_LEADERS.map((g) => ({ id: g.id, x: g.x, y: g.y })),
      ...EXAM_GATES.map((g) => ({ id: g.id, x: g.x, y: g.y })),
      ...PROJECT_MARKERS.map((m) => ({ id: m.id, x: m.x, y: m.y })),
      ...HOUSE_DOORS.map((d) => ({ id: d.id, x: d.x, y: d.y })),
    ]

    let nearestId: string | null = null
    let nearestDist = Infinity
    for (const t of targets) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y)
      if (d < INTERACT_RADIUS && d < nearestDist) {
        nearestDist = d
        nearestId = t.id
      }
    }

    this.activeTargetId = nearestId
    this.interactHint.setVisible(!!nearestId)
    if (nearestId) {
      this.interactHint.setPosition(this.player.x, this.player.y - 24)
    }
  }

  // ── dialogue / battle offers ────────────────────────────────
  private promptYesNo(yesLabel: string, noLabel: string, cb: (yes: boolean) => void) {
    new ChoiceMenu(this, {
      x: GAME_WIDTH / 2 - 70,
      y: GAME_HEIGHT / 2 - 20,
      options: [yesLabel, noLabel],
      spacing: 26,
      onSelect: (i) => cb(i === 0),
    })
  }

  private startInteraction(id: string) {
    this.uiLocked = true
    this.player.setVelocity(0, 0)
    this.interactHint.setVisible(false)

    if (id === BYTE.id) {
      const save = this.registry.get('save') as SaveData
      this.dialogueBox.setPortrait('byte-portrait')
      this.dialogueBox.setSpeaker('Professor Byte')
      const name = save.playerName || 'traveler'
      this.dialogueBox.showLines(
        [
          `Good to see you again, ${name}.`,
          'The road east now runs all the way to Vertex City.\nWorth the walk.',
          'Press T any time to reopen your Developer Journal.',
        ],
        () => {
          this.dialogueBox.setPortrait(null)
          this.dialogueBox.setVisible(false)
          this.uiLocked = false
        },
      )
      return
    }

    const door = HOUSE_DOORS.find((d) => d.id === id)
    if (door) {
      this.scene.launch('Interior', {
        roomId: door.roomId,
        onExit: () => {
          this.scene.stop('Interior')
          this.scene.resume()
          this.input.keyboard!.enabled = true
          this.input.keyboard!.enableGlobalCapture()
          this.uiLocked = false
        },
      })
      this.input.keyboard!.enabled = false
      this.input.keyboard!.disableGlobalCapture()
      this.scene.pause()
      return
    }

    const gymLeader = GYM_LEADERS.find((g) => g.id === id)
    if (gymLeader) {
      const save = this.registry.get('save') as SaveData
      const config = findGym(gymLeader.battleId)
      const already = save.badges.includes(config.id)
      this.dialogueBox.setPortrait(`${gymLeader.id}-portrait`)
      this.dialogueBox.setSpeaker(gymLeader.name)
      this.dialogueBox.showLines(already ? gymLeader.returnLines : gymLeader.introLines, () => {
        this.dialogueBox.setPortrait(null)
        this.dialogueBox.setVisible(false)
        this.promptYesNo(already ? 'Battle Again' : 'Accept the Challenge', 'Not Right Now', (yes) => {
          if (yes) this.launchBattle(config)
          else this.uiLocked = false
        })
      })
      return
    }

    const gate = EXAM_GATES.find((g) => g.id === id)
    if (gate) {
      const save = this.registry.get('save') as SaveData
      const config = findExam(gate.battleId)
      const already = save.badges.includes(config.id)
      this.dialogueBox.setPortrait(`${gate.id}-portrait`)
      this.dialogueBox.setSpeaker(gate.name)

      if (already) {
        this.dialogueBox.showLines(gate.returnLines, () => {
          this.dialogueBox.setPortrait(null)
          this.dialogueBox.setVisible(false)
          this.uiLocked = false
        })
        return
      }

      const missing = gate.requiredClues.filter((c) => !save.clues.includes(c))
      if (missing.length > 0) {
        const hints = missing.map((c) => `\u2022 ${CLUE_HINTS[c] ?? c}`)
        this.dialogueBox.showLines([gate.lockedLine, ...hints], () => {
          this.dialogueBox.setPortrait(null)
          this.dialogueBox.setVisible(false)
          this.uiLocked = false
        })
        return
      }

      if (!save.gatesOpen.includes(gate.id)) {
        this.dialogueBox.showLines([gate.readyLine], () => {
          this.dialogueBox.setVisible(false)
          this.startCodeEntry(gate)
        })
        return
      }

      this.dialogueBox.showLines(gate.introLines, () => {
        this.dialogueBox.setPortrait(null)
        this.dialogueBox.setVisible(false)
        this.promptYesNo('Take the Exam', 'Not Yet', (yes) => {
          if (yes) this.launchBattle(config)
          else this.uiLocked = false
        })
      })
      return
    }

    const marker = PROJECT_MARKERS.find((m) => m.id === id)
    if (marker) {
      const save = this.registry.get('save') as SaveData
      const config = findProject(marker.id)
      const already = save.projectsFound.includes(marker.id)
      this.dialogueBox.setPortrait(null)
      this.dialogueBox.showLines([already ? marker.foundLine : marker.discoveryLine], () => {
        this.dialogueBox.setVisible(false)
        if (already) {
          this.uiLocked = false
          return
        }
        const verb = marker.kind === 'portal' ? 'Step Through' : 'Investigate'
        this.promptYesNo(verb, 'Not Now', (yes) => {
          if (!yes) {
            this.uiLocked = false
            return
          }
          if (marker.kind === 'portal') this.launchDungeon(marker)
          else this.launchBattle(config)
        })
      })
      return
    }

    const npc = NPCS.find((n) => n.id === id)
    if (!npc) {
      this.uiLocked = false
      return
    }

    const visitCount = this.visitCounts.get(id) ?? 0
    const save = this.registry.get('save') as SaveData
    const lines = npc.getLines(save, visitCount)
    this.visitCounts.set(id, visitCount + 1)

    this.dialogueBox.setPortrait(npc.kind === 'actor' ? `${npc.id}-portrait` : null)
    this.dialogueBox.setSpeaker(npc.kind === 'actor' ? npc.name : null)
    this.dialogueBox.showLines(lines, () => {
      this.dialogueBox.setPortrait(null)
      this.dialogueBox.setVisible(false)

      if (npc.grantsClue) {
        const save2 = this.registry.get('save') as SaveData
        if (!save2.clues.includes(npc.grantsClue)) {
          save2.clues.push(npc.grantsClue)
          this.registry.set('save', save2)
          writeSave(save2)
          useUIStore.getState().updateSaveSnapshot(save2)
          this.time.delayedCall(150, () => showClueFound(this, npc.name))
        }
      }

      if (npc.id === 'kavi') {
        this.promptYesNo('Spar with Kavi', 'Maybe Later', (yes) => {
          if (yes) this.launchBattle(KAVI_PRACTICE)
          else this.uiLocked = false
        })
      } else {
        this.uiLocked = false
      }
    })
  }

  // ── escape-room gate puzzle ──────────────────────────────────
  private startCodeEntry(gate: ExamGateNPC) {
    let handle: CodeEntryHandle
    handle = promptCodeEntry(
      this,
      gate.code.length,
      'ENTER CODE',
      (entered) => {
        if (entered === gate.code) {
          handle.destroy()
          this.unlockGate(gate)
        } else {
          handle.shakeWrong()
        }
      },
      () => {
        this.uiLocked = false
      },
    )
  }

  private unlockGate(gate: ExamGateNPC) {
    const save = this.registry.get('save') as SaveData
    if (!save.gatesOpen.includes(gate.id)) {
      save.gatesOpen.push(gate.id)
      this.registry.set('save', save)
      writeSave(save)
      useUIStore.getState().updateSaveSnapshot(save)
    }

    this.openGateBarrier(gate.id)

    this.dialogueBox.setPortrait(`${gate.id}-portrait`)
    this.dialogueBox.setSpeaker(gate.name)
    this.dialogueBox.setVisible(true)
    this.dialogueBox.showLines(['Correct. The gate creaks open.'], () => {
      this.dialogueBox.showLines(gate.introLines, () => {
        this.dialogueBox.setPortrait(null)
        this.dialogueBox.setVisible(false)
        const config = findExam(gate.battleId)
        this.promptYesNo('Take the Exam', 'Not Yet', (yes) => {
          if (yes) this.launchBattle(config)
          else this.uiLocked = false
        })
      })
    })
  }

  private openGateBarrier(id: string) {
    const barrier = this.gateBarriers.get(id)
    if (!barrier) return
    const body = barrier.body as Phaser.Physics.Arcade.StaticBody | null
    if (body) body.enable = false
    this.tweens.add({ targets: barrier, alpha: 0, y: barrier.y - 12, duration: 400, onComplete: () => barrier.destroy() })
    this.gateBarriers.delete(id)
  }

  // ── battle launch + resolution ──────────────────────────────
  private launchBattle(config: BattleConfig) {
    const save = this.registry.get('save') as SaveData
    this.scene.launch('Battle', {
      config,
      playerName: save.playerName || 'You',
      onComplete: (won: boolean) => this.onBattleComplete(config, won),
    })
    this.input.keyboard!.enabled = false
    this.input.keyboard!.disableGlobalCapture()
    this.scene.pause()
  }

  // ── dungeon (portal) launch + resolution ─────────────────────
  private dungeonConfigFor(projectId: string): DungeonConfig {
    if (projectId === 'attendsmart') return ATTEND_DUNGEON
    return CHRONO_DUNGEON
  }

  private launchDungeon(marker: ProjectMarker) {
    this.scene.launch('Dungeon', {
      config: this.dungeonConfigFor(marker.id),
      onComplete: (won: boolean) => this.onDungeonComplete(marker, won),
    })
    this.input.keyboard!.enabled = false
    this.input.keyboard!.disableGlobalCapture()
    this.scene.pause()
  }

  private onDungeonComplete(marker: ProjectMarker, won: boolean) {
    this.scene.stop('Dungeon')
    this.scene.resume()
    this.input.keyboard!.enabled = true
    this.input.keyboard!.enableGlobalCapture()

    if (!won) {
      this.uiLocked = false
      return
    }

    const save = this.registry.get('save') as SaveData
    const config = findProject(marker.id)
    const firstWin = !save.projectsFound.includes(marker.id)

    if (firstWin) {
      save.projectsFound.push(marker.id)
      const leveledUp = (config.skillTags ?? []).map((skill) => ({ skill, level: levelUpSkill(save, skill) }))
      this.registry.set('save', save)
      writeSave(save)
      useUIStore.getState().updateSaveSnapshot(save)
      this.clearExclaim(marker.id)

      this.time.delayedCall(200, () => showAchievement(this, 'PROJECT RESTORED', config.badgeName ?? marker.name))
      leveledUp.forEach((lv, i) => {
        this.time.delayedCall(700 + i * 500, () => showLevelUp(this, lv.skill, lv.level))
      })
      this.time.delayedCall(1500, () => {
        window.dispatchEvent(new CustomEvent('open-project-archive', { detail: { projectId: marker.id } }))
      })
    }

    this.uiLocked = false
  }

  private onBattleComplete(config: BattleConfig, won: boolean) {
    this.scene.stop('Battle')
    this.scene.resume()
    this.input.keyboard!.enabled = true
    this.input.keyboard!.enableGlobalCapture()

    if (!won) {
      this.uiLocked = false
      return
    }

    const save = this.registry.get('save') as SaveData
    const isMilestone = config.kind === 'gym' || config.kind === 'exam' || config.kind === 'project'
    const trackList = config.kind === 'project' ? save.projectsFound : save.badges
    const firstWin = isMilestone && !trackList.includes(config.id)

    if ((config.kind === 'wild' || config.kind === 'practice') && config.rewardPoints) {
      save.debugPoints += config.rewardPoints
    }
    if (firstWin) {
      trackList.push(config.id)
    }

    const leveledUp: { skill: string; level: number }[] =
      firstWin && config.skillTags ? config.skillTags.map((skill) => ({ skill, level: levelUpSkill(save, skill) })) : []

    this.registry.set('save', save)
    writeSave(save)
    useUIStore.getState().updateSaveSnapshot(save)
    this.debugPointsText.setText(`\u1D9C Bugs Squashed: ${save.debugPoints}`)
    this.clearExclaim(config.id)

    const lines = !isMilestone
      ? config.victoryLines
      : firstWin
        ? config.victoryLines
        : [`${config.bossName}, already cleared.`, 'Good practice round, though.']

    this.dialogueBox.setVisible(true)
    this.dialogueBox.showLines(lines, () => {
      this.dialogueBox.setVisible(false)
      this.uiLocked = false

      if (firstWin && config.badgeName) {
        if (config.kind === 'exam') this.spawnSparkle(this.player.x, this.player.y)
        this.time.delayedCall(200, () => showAchievement(this, 'BADGE EARNED', config.badgeName!))
        leveledUp.forEach((lv, i) => {
          this.time.delayedCall(750 + i * 500, () => showLevelUp(this, lv.skill, lv.level))
        })
      } else if (!isMilestone && config.rewardPoints) {
        this.time.delayedCall(200, () =>
          showAchievement(this, 'POINTS EARNED', `+${config.rewardPoints} Debug Points \u00b7 ${save.debugPoints} total`),
        )
      }
    })
  }

  // ── flourishes ───────────────────────────────────────────────
  private spawnSparkle(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const p = this.add.circle(x, y, 2, 0xffcd75).setDepth(3000)
      const angle = Math.random() * Math.PI * 2
      const dist = 18 + Math.random() * 22
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 450 + Math.random() * 300,
        onComplete: () => p.destroy(),
      })
    }
  }

  private createButterflies() {
    const colors = [0xffcd75, 0xef476f, 0xffffff]
    for (let i = 0; i < 4; i++) {
      const startX = 60 + Math.random() * (TILE_COLS * TILE_SIZE - 120)
      const startY = 40 + Math.random() * (TILE_ROWS * TILE_SIZE - 160)
      const b = this.add.rectangle(startX, startY, 3, 3, colors[i % colors.length]).setDepth(500)
      this.tweens.add({
        targets: b,
        x: startX + (Math.random() > 0.5 ? 110 : -110),
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
      this.tweens.add({
        targets: b,
        y: startY + 18,
        duration: 1200 + Math.random() * 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
  }
}
