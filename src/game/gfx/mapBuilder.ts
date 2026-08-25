import { TILE } from './tileset'

export const TILE_COLS = 90
export const TILE_ROWS = 24

// region boundaries, in tile columns
export const VILLAGE_END_COL = 40
export const ROUTE_END_COL = 64

function hash(x: number, y: number, seed: number): number {
  let h = (x * 928371 + y * 689287 + seed) % 2147483647
  if (h < 0) h += 2147483647
  return h
}

export interface MapBuildResult {
  grid: number[][]
  reservedTiles: [number, number][]
}

export function buildMapData(): MapBuildResult {
  const grid: number[][] = []
  for (let y = 0; y < TILE_ROWS; y++) {
    grid.push(new Array(TILE_COLS).fill(TILE.GRASS))
  }

  for (let x = 0; x < TILE_COLS; x++) {
    grid[0][x] = TILE.FENCE
    grid[TILE_ROWS - 1][x] = TILE.FENCE
  }
  for (let y = 0; y < TILE_ROWS; y++) {
    grid[y][0] = TILE.FENCE
    grid[y][TILE_COLS - 1] = TILE.FENCE
  }

  const setRect = (x0: number, y0: number, x1: number, y1: number, tile: number) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y][x] = tile
  }
  const setHLine = (x0: number, x1: number, y: number, tile: number) => {
    for (let x = x0; x <= x1; x++) grid[y][x] = tile
  }
  const setVLine = (x: number, y0: number, y1: number, tile: number) => {
    for (let y = y0; y <= y1; y++) grid[y][x] = tile
  }

  // ── main east-west road, spanning all three regions ──────────
  setHLine(16, 86, 10, TILE.PATH)

  // ── boundary walls: the only way through is the gated path tile ──
  setVLine(40, 1, 9, TILE.FENCE)
  setVLine(40, 11, 22, TILE.FENCE)
  setVLine(64, 1, 9, TILE.FENCE)
  setVLine(64, 11, 22, TILE.FENCE)

  // ═══════════════════════════════════════════════════════════
  // REGION 1 — Harmony Village (cols 0-39)
  // ═══════════════════════════════════════════════════════════
  setVLine(6, 15, 17, TILE.PATH)
  setHLine(6, 10, 17, TILE.PATH)
  setRect(10, 17, 16, 19, TILE.PATH) // village plaza
  setVLine(16, 10, 17, TILE.PATH)

  // player's home
  setHLine(5, 7, 13, TILE.ROOF)
  grid[14][5] = TILE.WALL
  grid[14][6] = TILE.DOOR
  grid[14][7] = TILE.WALL

  // professor byte's lab
  setHLine(19, 21, 8, TILE.ROOF)
  grid[9][19] = TILE.WALL
  grid[9][20] = TILE.DOOR
  grid[9][21] = TILE.WALL

  // pond
  setRect(30, 4, 32, 6, TILE.WATER)

  // ═══════════════════════════════════════════════════════════
  // REGION 2 — Scholar's Route (cols 40-63): a tree-lined corridor
  // ═══════════════════════════════════════════════════════════
  setHLine(40, 63, 6, TILE.TREE)
  setHLine(40, 63, 14, TILE.TREE)
  setRect(48, 9, 52, 11, TILE.PATH) // small clearing for Priya

  // study hall
  setHLine(55, 57, 7, TILE.ROOF)
  grid[8][55] = TILE.WALL
  grid[8][56] = TILE.DOOR
  grid[8][57] = TILE.WALL

  // ═══════════════════════════════════════════════════════════
  // REGION 3 — Vertex City (cols 64-89): campus buildings + plaza
  // ═══════════════════════════════════════════════════════════
  // Vertex Hall
  setHLine(68, 72, 6, TILE.ROOF)
  grid[7][68] = TILE.WALL
  grid[7][69] = TILE.WALL
  grid[7][70] = TILE.DOOR
  grid[7][71] = TILE.WALL
  grid[7][72] = TILE.WALL

  // Research Lab
  setHLine(78, 81, 6, TILE.ROOF)
  grid[7][78] = TILE.WALL
  grid[7][79] = TILE.DOOR
  grid[7][80] = TILE.WALL
  grid[7][81] = TILE.WALL

  setVLine(75, 10, 13, TILE.PATH) // connector from the main road
  setRect(66, 14, 86, 17, TILE.PATH) // campus plaza
  setRect(74, 15, 76, 16, TILE.WATER) // fountain

  const reservedTiles: [number, number][] = [
    [6, 15],
    [9, 15],
    [13, 18],
    [10, 16],
    [20, 10],
    [50, 9], // priya
    [41, 9], // route welcome sign
    [70, 15], // campus guide
    [85, 9], // phase-4 tease sign
    [29, 5], // pond sign
    [38, 9], // ssc exam gate
    [61, 9], // hsc exam gate
    [70, 8], // gym leader — lina
    [79, 8], // gym leader — renn
  ]

  const reserved = new Set(reservedTiles.map(([x, y]) => `${x},${y}`))
  const reserve = (x: number, y: number, r = 1) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) reserved.add(`${x + dx},${y + dy}`)
  }
  reservedTiles.forEach(([x, y]) => reserve(x, y))

  for (let y = 1; y < TILE_ROWS - 1; y++) {
    for (let x = 1; x < TILE_COLS - 1; x++) {
      if (grid[y][x] !== TILE.GRASS || reserved.has(`${x},${y}`)) continue
      if (hash(x, y, 17) % 100 < 5) grid[y][x] = TILE.FLOWER
    }
  }
  for (let y = 1; y < TILE_ROWS - 1; y++) {
    for (let x = 1; x < TILE_COLS - 1; x++) {
      if ((grid[y][x] !== TILE.GRASS && grid[y][x] !== TILE.FLOWER) || reserved.has(`${x},${y}`)) continue
      if (hash(x, y, 71) % 100 < 7) grid[y][x] = TILE.TREE
    }
  }

  return { grid, reservedTiles }
}
