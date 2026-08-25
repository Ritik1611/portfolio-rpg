import Phaser from 'phaser'
import { THEME } from '../config'
import type { SaveData } from '../config'
import { DialogueBox } from '../objects/DialogueBox'
import { generateActorTexture, generatePortraitTexture } from '../gfx/pixelActor'
import { BYTE } from '../data/npcs'
import { runWelcomeConversation } from '../systems/WelcomeConversation'
import { TUTORIAL_BATTLE } from '../data/battles'

export class OpeningScene extends Phaser.Scene {
  private dialogueBox!: DialogueBox

  constructor() {
    super({ key: 'Opening' })
  }

  create() {
    this.cameras.main.setBackgroundColor(THEME.twilightPurple)
    this.cameras.main.fadeIn(500)

    generateActorTexture(this, BYTE.id, BYTE.palette)
    const portraitKey = generatePortraitTexture(this, BYTE.id, BYTE.palette)

    this.dialogueBox = new DialogueBox(this)
    runWelcomeConversation(this, this.dialogueBox, portraitKey, () => this.startTutorial())
  }

  private startTutorial() {
    this.dialogueBox.setVisible(false)
    this.dialogueBox.setPortrait('byte-portrait')
    this.dialogueBox.showLines(
      ['One more thing before you go \u2014 let\u2019s make sure you know how this works.', 'Nothing to lose here. Just a practice round.'],
      () => {
        this.dialogueBox.setVisible(false)
        const save = this.registry.get('save') as SaveData
        this.scene.launch('Battle', {
          config: TUTORIAL_BATTLE,
          playerName: save.playerName || 'You',
          onComplete: () => {
            this.scene.stop('Battle')
            this.scene.resume()
            this.finish()
          },
        })
        this.scene.pause()
      },
    )
  }

  private finish() {
    this.cameras.main.fadeOut(400, 0, 0, 0)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('Village')
    })
  }
}
