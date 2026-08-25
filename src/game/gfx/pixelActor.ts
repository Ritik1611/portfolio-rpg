import Phaser from 'phaser'

export interface ActorPalette {
  skin: string
  hair: string
  outfit: string
  accent: string
  pants: string
  accessory?: 'glasses' | 'cap' | 'bow'
  accessoryColor?: string
}

export const UNIT = 2 // world-sprite pixel unit
export const PORTRAIT_UNIT = 6 // dialogue-portrait pixel unit
export const GRID_W = 8
export const GRID_H = 13 // last row (12) is the ground shadow

export type Direction = 'down' | 'up' | 'left' | 'right'

function shade(hex: string, percent: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  let r = (n >> 16) & 0xff
  let g = (n >> 8) & 0xff
  let b = n & 0xff
  const amt = Math.round(2.55 * percent)
  r = Math.max(0, Math.min(255, r + amt))
  g = Math.max(0, Math.min(255, g + amt))
  b = Math.max(0, Math.min(255, b + amt))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/** Draws one character frame (8x13 grid units) at (ox, oy) in canvas pixel space. */
function drawActorFrame(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  unit: number,
  palette: ActorPalette,
  direction: Direction,
  frame: number,
) {
  const blk = (gx: number, gy: number, gw: number, gh: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(ox + gx * unit, oy + gy * unit, gw * unit, gh * unit)
  }

  const eyeColor = '#1a1c2c'
  const hairTop = shade(palette.hair, 18)
  const sleeveShadow = shade(palette.outfit, -18)

  // ground shadow
  blk(2, 12, 4, 1, 'rgba(10,10,20,0.28)')

  // hair — top + sides
  blk(2, 0, 4, 1, hairTop)
  blk(1, 1, 6, 1, palette.hair)
  blk(1, 2, 1, 1, palette.hair)
  blk(6, 2, 1, 1, palette.hair)

  if (direction === 'up') {
    // back of head — no face
    blk(2, 2, 4, 3, palette.hair)
  } else {
    blk(2, 2, 4, 3, palette.skin)
    if (direction === 'down') {
      blk(2, 3, 1, 1, eyeColor)
      blk(5, 3, 1, 1, eyeColor)
    } else if (direction === 'left') {
      blk(2, 3, 1, 1, eyeColor)
    } else if (direction === 'right') {
      blk(5, 3, 1, 1, eyeColor)
    }
  }

  // accessories drawn over the head/face
  if (palette.accessory === 'glasses' && direction !== 'up') {
    const gc = palette.accessoryColor ?? '#1a1c2c'
    if (direction !== 'right') blk(2, 3, 1, 1, gc)
    if (direction !== 'left') blk(5, 3, 1, 1, gc)
    blk(3, 3, 2, 1, gc)
  }
  if (palette.accessory === 'cap') {
    const cc = palette.accessoryColor ?? palette.accent
    blk(1, 0, 6, 1, cc)
    blk(2, 0, 4, 1, cc)
    if (direction === 'down') blk(2, 1, 4, 1, shade(cc, -10))
    if (direction === 'left') blk(0, 1, 2, 1, cc)
    if (direction === 'right') blk(6, 1, 2, 1, cc)
  }
  if (palette.accessory === 'bow') {
    const bc = palette.accessoryColor ?? palette.accent
    blk(6, 1, 1, 1, bc)
    blk(7, 0, 1, 1, bc)
  }

  // collar / torso / sleeves
  blk(2, 5, 4, 1, palette.accent)
  blk(1, 6, 6, 2, palette.outfit)
  blk(1, 7, 1, 1, sleeveShadow)
  blk(6, 7, 1, 1, sleeveShadow)

  // waist + pants
  blk(2, 8, 4, 1, palette.accent)
  blk(2, 9, 4, 1, palette.pants)

  // legs — frame 1 widens the stride for a walk cycle
  if (frame === 0) {
    blk(2, 10, 2, 2, palette.pants)
    blk(4, 10, 2, 2, shade(palette.pants, -10))
  } else {
    blk(1, 10, 2, 2, shade(palette.pants, -10))
    blk(5, 10, 2, 2, palette.pants)
  }
}

const DIRS: Direction[] = ['down', 'down', 'left', 'left', 'right', 'right', 'up', 'up']
const FRAMES = [0, 1, 0, 1, 0, 1, 0, 1]

export interface ActorTextureInfo {
  key: string
  frameWidth: number
  frameHeight: number
}

/** Generates an 8-frame walk spritesheet texture + 4-direction animations for a palette. */
export function generateActorTexture(scene: Phaser.Scene, key: string, palette: ActorPalette): ActorTextureInfo {
  const frameW = GRID_W * UNIT
  const frameH = GRID_H * UNIT

  if (scene.textures.exists(key)) {
    return { key, frameWidth: frameW, frameHeight: frameH }
  }

  const canvasTexture = scene.textures.createCanvas(key, frameW * 8, frameH)!
  const ctx = canvasTexture.getContext()
  ctx.imageSmoothingEnabled = false

  DIRS.forEach((dir, i) => {
    drawActorFrame(ctx, i * frameW, 0, UNIT, palette, dir, FRAMES[i])
  })

  canvasTexture.refresh()
  for (let i = 0; i < 8; i++) {
    canvasTexture.add(i, 0, i * frameW, 0, frameW, frameH)
  }

  ;(['down', 'left', 'right', 'up'] as Direction[]).forEach((dir, idx) => {
    const a = idx * 2
    const b = idx * 2 + 1
    scene.anims.create({
      key: `${key}-walk-${dir}`,
      frames: [{ key, frame: a }, { key, frame: b }],
      frameRate: 4,
      repeat: -1,
    })
  })

  return { key, frameWidth: frameW, frameHeight: frameH }
}

/** Static idle frame index for a given facing direction (matches the walk-cycle "A" pose). */
export function idleFrame(direction: Direction): number {
  switch (direction) {
    case 'down':
      return 0
    case 'left':
      return 2
    case 'right':
      return 4
    case 'up':
      return 6
  }
}

/** Generates a bust portrait (head + shoulders) for use inside the dialogue box. */
export function generatePortraitTexture(scene: Phaser.Scene, key: string, palette: ActorPalette): string {
  const portraitKey = `${key}-portrait`
  if (scene.textures.exists(portraitKey)) return portraitKey

  const w = GRID_W * PORTRAIT_UNIT
  const h = 9 * PORTRAIT_UNIT
  const canvasTexture = scene.textures.createCanvas(portraitKey, w, h)!
  const ctx = canvasTexture.getContext()
  ctx.imageSmoothingEnabled = false

  ctx.fillStyle = '#00000000'
  drawActorFrame(ctx, 0, 0, PORTRAIT_UNIT, palette, 'down', 0)

  canvasTexture.refresh()
  return portraitKey
}
