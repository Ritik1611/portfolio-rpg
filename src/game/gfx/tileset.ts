import Phaser from 'phaser'

export const TILE_SIZE = 16

export const TILE = {
  GRASS: 0,
  FLOWER: 1,
  PATH: 2,
  TREE: 3,
  WATER: 4,
  WALL: 5,
  ROOF: 6,
  DOOR: 7,
  FENCE: 8,
} as const

export const BLOCKING_TILES = [TILE.TREE, TILE.WATER, TILE.WALL, TILE.ROOF, TILE.FENCE]

export const TILESET_KEY = 'village-tileset'
const TILE_COUNT = 9

function drawGrassBase(ctx: CanvasRenderingContext2D, tx: number) {
  const x0 = tx * TILE_SIZE
  const r = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c
    ctx.fillRect(x0 + x, y, w, h)
  }
  r(0, 0, 16, 16, '#3a7d44')
  r(2, 2, 2, 2, '#2f6636')
  r(9, 5, 2, 1, '#2f6636')
  r(5, 10, 2, 2, '#2f6636')
  r(12, 12, 2, 1, '#2f6636')
  r(3, 13, 2, 1, '#2f6636')
  r(7, 2, 1, 3, '#4f9a58')
  r(2, 9, 1, 2, '#4f9a58')
  r(12, 6, 1, 2, '#4f9a58')
}

export function generateTileset(scene: Phaser.Scene): void {
  if (scene.textures.exists(TILESET_KEY)) return

  const canvasTexture = scene.textures.createCanvas(TILESET_KEY, TILE_SIZE * TILE_COUNT, TILE_SIZE)!
  const ctx = canvasTexture.getContext()
  ctx.imageSmoothingEnabled = false

  const r = (tx: number, x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c
    ctx.fillRect(tx * TILE_SIZE + x, y, w, h)
  }

  // GRASS
  drawGrassBase(ctx, TILE.GRASS)

  // FLOWER (grass + blossoms)
  drawGrassBase(ctx, TILE.FLOWER)
  const flowers: [number, number, string][] = [
    [3, 3, '#ef476f'],
    [10, 5, '#ffcd75'],
    [6, 11, '#ffffff'],
  ]
  flowers.forEach(([fx, fy, c]) => {
    r(TILE.FLOWER, fx, fy, 2, 2, c)
    r(TILE.FLOWER, fx, fy - 1, 1, 1, c)
    r(TILE.FLOWER, fx + 1, fy + 2, 1, 1, '#38b764')
  })

  // PATH
  r(TILE.PATH, 0, 0, 16, 16, '#c9a876')
  r(TILE.PATH, 3, 3, 2, 1, '#a98653')
  r(TILE.PATH, 9, 7, 1, 2, '#a98653')
  r(TILE.PATH, 6, 12, 2, 1, '#a98653')
  r(TILE.PATH, 13, 4, 1, 1, '#a98653')
  r(TILE.PATH, 2, 10, 1, 1, '#a98653')

  // TREE (on grass)
  drawGrassBase(ctx, TILE.TREE)
  r(TILE.TREE, 6, 10, 4, 5, '#6b4a2f')
  r(TILE.TREE, 7, 10, 2, 5, '#83603f')
  r(TILE.TREE, 2, 1, 12, 9, '#1f5c2a')
  r(TILE.TREE, 3, 2, 10, 7, '#2f7a3b')
  r(TILE.TREE, 4, 3, 6, 4, '#3f9a4b')
  r(TILE.TREE, 5, 3, 3, 2, '#57b862')

  // WATER
  r(TILE.WATER, 0, 0, 16, 16, '#3a6ea5')
  r(TILE.WATER, 0, 7, 16, 1, '#2d5786')
  r(TILE.WATER, 1, 3, 3, 1, '#5a8ec9')
  r(TILE.WATER, 6, 3, 3, 1, '#5a8ec9')
  r(TILE.WATER, 11, 3, 3, 1, '#5a8ec9')
  r(TILE.WATER, 3, 11, 3, 1, '#5a8ec9')
  r(TILE.WATER, 9, 11, 3, 1, '#5a8ec9')

  // WALL
  r(TILE.WALL, 0, 0, 16, 16, '#d8c9a3')
  r(TILE.WALL, 0, 5, 16, 1, '#a89570')
  r(TILE.WALL, 0, 10, 16, 1, '#a89570')
  r(TILE.WALL, 8, 0, 1, 5, '#a89570')
  r(TILE.WALL, 4, 5, 1, 5, '#a89570')
  r(TILE.WALL, 12, 5, 1, 5, '#a89570')
  r(TILE.WALL, 8, 10, 1, 6, '#a89570')

  // ROOF
  r(TILE.ROOF, 0, 0, 16, 16, '#7a3b3b')
  r(TILE.ROOF, 0, 0, 16, 2, '#9a5050')
  r(TILE.ROOF, 0, 4, 16, 1, '#5c2b2b')
  r(TILE.ROOF, 0, 7, 16, 1, '#5c2b2b')
  r(TILE.ROOF, 0, 10, 16, 1, '#5c2b2b')
  r(TILE.ROOF, 0, 13, 16, 1, '#5c2b2b')

  // DOOR
  r(TILE.DOOR, 0, 0, 16, 16, '#5a3a22')
  r(TILE.DOOR, 2, 2, 12, 13, '#7a5535')
  r(TILE.DOOR, 11, 8, 2, 2, '#e8c765')

  // FENCE (on grass)
  drawGrassBase(ctx, TILE.FENCE)
  r(TILE.FENCE, 0, 4, 16, 2, '#a1815a')
  r(TILE.FENCE, 0, 9, 16, 2, '#a1815a')
  r(TILE.FENCE, 2, 1, 2, 14, '#8a6a45')
  r(TILE.FENCE, 7, 1, 2, 14, '#8a6a45')
  r(TILE.FENCE, 12, 1, 2, 14, '#8a6a45')

  canvasTexture.refresh()
}

export const SIGN_KEY = 'sign-icon'

/** A small wooden signpost, used for both the welcome sign and the road-closed sign. */
export function generateSignTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(SIGN_KEY)) return

  const w = 16
  const h = 20
  const canvasTexture = scene.textures.createCanvas(SIGN_KEY, w, h)!
  const ctx = canvasTexture.getContext()
  ctx.imageSmoothingEnabled = false

  const r = (x: number, y: number, ww: number, hh: number, c: string) => {
    ctx.fillStyle = c
    ctx.fillRect(x, y, ww, hh)
  }

  r(6, 8, 3, 12, '#6b4a2f') // post
  r(1, 2, 14, 8, '#8a6a45') // board
  r(1, 2, 14, 2, '#a1815a') // board highlight
  r(3, 5, 10, 1, '#f4e9d8') // "text" lines
  r(3, 7, 7, 1, '#f4e9d8')

  canvasTexture.refresh()
}

export const GATE_KEY = 'gate-barrier'

/** A locked boom-gate barrier that physically blocks a path until its code is solved. */
export function generateGateTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(GATE_KEY)) return

  const w = 16
  const h = 28
  const canvasTexture = scene.textures.createCanvas(GATE_KEY, w, h)!
  const ctx = canvasTexture.getContext()
  ctx.imageSmoothingEnabled = false

  const r = (x: number, y: number, ww: number, hh: number, c: string) => {
    ctx.fillStyle = c
    ctx.fillRect(x, y, ww, hh)
  }

  r(1, 0, 3, 28, '#3a3f5c') // left post
  r(12, 0, 3, 28, '#3a3f5c')
  r(2, 10, 12, 6, '#ef476f') // barrier bar
  r(2, 10, 3, 6, '#f4e9d8')
  r(9, 10, 3, 6, '#f4e9d8')
  r(6, 15, 4, 5, '#ffcd75') // lock body
  r(7, 13, 2, 3, '#5a6988') // lock shackle

  canvasTexture.refresh()
}

