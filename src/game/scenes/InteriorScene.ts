import Phaser from 'phaser'
import { GAME_WIDTH, THEME, FONT_DISPLAY, FONT_BODY, writeSave } from '../config'
import type { SaveData } from '../config'
import { DialogueBox, hexToNum } from '../objects/DialogueBox'
import { ChoiceMenu } from '../objects/ChoiceMenu'
import { showClueFound } from '../objects/AchievementToast'
import { INTERIORS } from '../data/interiors'
import type { InteriorObject } from '../data/interiors'
import { useUIStore } from '../../store/gameStore'

export interface InteriorSceneData {
  roomId: string
  onExit: () => void
}

const ICON_POSITIONS: [number, number][] = [
  [130, 108],
  [240, 108],
  [350, 108],
]

export class InteriorScene extends Phaser.Scene {
  private roomId!: string
  private onExit!: () => void
  private dialogueBox!: DialogueBox
  private menu?: ChoiceMenu
  private locked = false

  constructor() {
    super({ key: 'Interior' })
  }

  init(data: InteriorSceneData) {
    this.roomId = data.roomId
    this.onExit = data.onExit
    this.locked = false
  }

  create() {
    const room = INTERIORS[this.roomId]
    this.cameras.main.setBackgroundColor(THEME.inkNavy)
    this.cameras.main.fadeIn(250)

    this.add.rectangle(GAME_WIDTH / 2, 90, GAME_WIDTH - 24, 150, hexToNum(THEME.twilightPurple)).setStrokeStyle(3, hexToNum(THEME.steelGrey))
    this.add.rectangle(GAME_WIDTH / 2, 165, GAME_WIDTH - 24, 8, hexToNum(THEME.inkNavy))
    this.add.rectangle(GAME_WIDTH / 2, 195, GAME_WIDTH - 24, 50, hexToNum(THEME.parchment), 0.08)

    this.add.text(GAME_WIDTH / 2, 26, room.title, { fontFamily: FONT_DISPLAY, fontSize: '13px', color: THEME.parchment }).setOrigin(0.5)
    this.add.text(GAME_WIDTH / 2, 46, room.flavorLine, { fontFamily: FONT_BODY, fontSize: '14px', color: THEME.steelGrey }).setOrigin(0.5)

    room.objects.forEach((obj, i) => {
      const [ox, oy] = ICON_POSITIONS[i % ICON_POSITIONS.length]
      const found = this.hasClue(obj.clueId)
      this.add
        .rectangle(ox, oy, 46, 46, hexToNum(THEME.parchment))
        .setStrokeStyle(2, hexToNum(found && obj.clueId ? THEME.mossGreen : THEME.inkNavy))
      this.add.text(ox, oy, obj.label[0], { fontFamily: FONT_DISPLAY, fontSize: '16px', color: THEME.inkNavy }).setOrigin(0.5)
      this.add.text(ox, oy + 32, obj.label, { fontFamily: FONT_BODY, fontSize: '12px', color: THEME.parchment }).setOrigin(0.5)
    })

    this.dialogueBox = new DialogueBox(this)
    this.input.keyboard?.on('keydown-ESC', () => {
      if (!this.locked) this.leave()
    })

    this.showMenu()
  }

  private hasClue(clueId?: string): boolean {
    if (!clueId) return false
    const save = this.registry.get('save') as SaveData
    return save.clues.includes(clueId)
  }

  private showMenu() {
    const room = INTERIORS[this.roomId]
    const options = [...room.objects.map((o) => `Examine ${o.label}`), 'Leave']
    this.menu = new ChoiceMenu(this, {
      x: GAME_WIDTH / 2 - 90,
      y: 232,
      options,
      spacing: 22,
      fontSize: '15px',
      onSelect: (i) => {
        this.menu = undefined
        if (i === room.objects.length) {
          this.leave()
          return
        }
        this.examine(room.objects[i])
      },
    })
  }

  private examine(obj: InteriorObject) {
    this.locked = true
    this.dialogueBox.setSpeaker(obj.label)
    this.dialogueBox.showLines(obj.lines, () => {
      this.dialogueBox.setVisible(false)
      if (obj.clueId) {
        const save = this.registry.get('save') as SaveData
        if (!save.clues.includes(obj.clueId)) {
          save.clues.push(obj.clueId)
          this.registry.set('save', save)
          writeSave(save)
          useUIStore.getState().updateSaveSnapshot(save)
          this.time.delayedCall(150, () => showClueFound(this, obj.label))
        }
      }
      this.locked = false
      this.showMenu()
    })
  }

  private leave() {
    this.locked = true
    this.menu?.destroy()
    this.scene.stop()
    this.onExit()
  }
}
