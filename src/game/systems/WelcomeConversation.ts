import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT, THEME, FONT_BODY, writeSave } from '../config'
import type { SaveData } from '../config'
import { DialogueBox, hexToNum } from '../objects/DialogueBox'
import { ChoiceMenu } from '../objects/ChoiceMenu'
import { PROFILE, VISITOR_LINES } from '../../data/profile'
import type { VisitorMode } from '../../data/profile'
import { timeGreeting } from '../data/npcs'

const OPENING_LINES = [
  `Oh! ${timeGreeting()} You found my lab.`,
  `I'm Professor Byte. I keep the archive for everyone who passes\nthrough here — right now, that's mostly ${PROFILE.name.split(' ')[0]}.`,
  'This world runs on Projects, Deadlines, and the occasional\nstubborn bug. For most people, that sounds like work.',
  "For the person who built it... it's an adventure.\n\nBefore you go exploring — what should I call you?",
]

const ROLE_OPTIONS: { label: string; mode: VisitorMode }[] = [
  { label: "I'm a Recruiter", mode: 'recruiter' },
  { label: "I'm an Engineer", mode: 'engineer' },
  { label: "I'm Curious", mode: 'curious' },
  { label: 'Just Exploring', mode: 'exploring' },
]

export function runWelcomeConversation(
  scene: Phaser.Scene,
  dialogueBox: DialogueBox,
  portraitKey: string,
  onComplete: () => void,
) {
  dialogueBox.setPortrait(portraitKey)
  dialogueBox.setSpeaker('Professor Byte')
  dialogueBox.showLines(OPENING_LINES, () => startNameEntry(scene, dialogueBox, portraitKey, onComplete))
}

function startNameEntry(scene: Phaser.Scene, dialogueBox: DialogueBox, portraitKey: string, onComplete: () => void) {
  dialogueBox.setVisible(false)

  let name = ''
  const promptY = GAME_HEIGHT / 2 - 20

  const box = scene.add
    .rectangle(GAME_WIDTH / 2, promptY, 240, 34, hexToNum(THEME.inkNavy))
    .setStrokeStyle(3, hexToNum(THEME.emberGold))
    .setScrollFactor(0)
    .setDepth(1001)

  const promptText = scene.add
    .text(GAME_WIDTH / 2, promptY, '>', {
      fontFamily: FONT_BODY,
      fontSize: '22px',
      color: THEME.parchment,
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1001)

  const render = () => {
    const cursor = Math.floor(scene.time.now / 400) % 2 === 0 ? '_' : ' '
    promptText.setText(`> ${name}${cursor}`)
  }
  const cursorTimer = scene.time.addEvent({ delay: 200, loop: true, callback: render })
  render()

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (name.trim().length === 0) return
      cleanup()
      finishNameEntry(scene, dialogueBox, portraitKey, name.trim(), onComplete)
      return
    }
    if (event.key === 'Backspace') {
      name = name.slice(0, -1)
      render()
      return
    }
    if (/^[a-zA-Z0-9 ]$/.test(event.key) && name.length < 14) {
      name += event.key
      render()
    }
  }

  const cleanup = () => {
    scene.input.keyboard?.off('keydown', onKey)
    cursorTimer.destroy()
    box.destroy()
    promptText.destroy()
  }

  scene.input.keyboard?.on('keydown', onKey)
}

function finishNameEntry(
  scene: Phaser.Scene,
  dialogueBox: DialogueBox,
  portraitKey: string,
  name: string,
  onComplete: () => void,
) {
  const save = scene.registry.get('save') as SaveData
  save.playerName = name
  scene.registry.set('save', save)
  writeSave(save)

  dialogueBox.setVisible(true)
  dialogueBox.showLines([`${name}? Got it.`, 'One more thing before you go...'], () =>
    startRoleChoice(scene, dialogueBox, portraitKey, onComplete),
  )
}

function startRoleChoice(scene: Phaser.Scene, dialogueBox: DialogueBox, portraitKey: string, onComplete: () => void) {
  dialogueBox.setVisible(false)

  const menu = new ChoiceMenu(scene, {
    x: GAME_WIDTH / 2 - 70,
    y: GAME_HEIGHT / 2 - 30,
    options: ROLE_OPTIONS.map((o) => o.label),
    spacing: 26,
    onSelect: (i) => {
      const mode = ROLE_OPTIONS[i].mode
      finishRoleChoice(scene, dialogueBox, portraitKey, mode, onComplete)
    },
  })
  void menu
}

function finishRoleChoice(
  scene: Phaser.Scene,
  dialogueBox: DialogueBox,
  portraitKey: string,
  mode: VisitorMode,
  onComplete: () => void,
) {
  const save = scene.registry.get('save') as SaveData
  save.visitorMode = mode
  save.hasCompletedIntro = true
  scene.registry.set('save', save)
  writeSave(save)

  dialogueBox.setVisible(true)
  dialogueBox.setPortrait(portraitKey)
  dialogueBox.showLines(
    [VISITOR_LINES[mode as Exclude<VisitorMode, null>], 'Here — take this. Your Developer Journal.\nPress T any time to open it.'],
    () => {
      dialogueBox.setPortrait(null)
      onComplete()
    },
  )
}
