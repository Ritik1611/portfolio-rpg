export const GAME_WIDTH = 480
export const GAME_HEIGHT = 320

export const SAVE_KEY = 'ritik_portfolio_save_v1'

export type VisitorMode = 'recruiter' | 'engineer' | 'curious' | 'exploring' | null

export interface SaveData {
  playerName: string
  visitorMode: VisitorMode
  hasCompletedIntro: boolean
  badges: string[]
  projectsFound: string[]
  visited: string[]
  debugPoints: number
  skillLevels: Record<string, number>
  clues: string[]
  gatesOpen: string[]
}

export const DEFAULT_SAVE: SaveData = {
  playerName: '',
  visitorMode: null,
  hasCompletedIntro: false,
  badges: [],
  projectsFound: [],
  visited: [],
  debugPoints: 0,
  skillLevels: {},
  clues: [],
  gatesOpen: [],
}

export function getSkillLevel(save: SaveData, skill: string): number {
  return save.skillLevels[skill] ?? 1
}

/** Levels up a skill by one and returns its new level. */
export function levelUpSkill(save: SaveData, skill: string): number {
  const next = getSkillLevel(save, skill) + 1
  save.skillLevels = { ...save.skillLevels, [skill]: next }
  return next
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return { ...DEFAULT_SAVE }
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SAVE }
  }
}

export function writeSave(save: SaveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  } catch {
    // storage unavailable (private browsing etc.) — fail silently
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // ignore
  }
}

// ── Theme tokens (GBA-cartridge palette) ──────────────────────
export const THEME = {
  inkNavy: '#1a1c2c',
  twilightPurple: '#29366f',
  parchment: '#f4e9d8',
  emberGold: '#ffcd75',
  mossGreen: '#38b764',
  signalRed: '#ef476f',
  steelGrey: '#5a6988',
  white: '#ffffff',
}

export const FONT_DISPLAY = '"Press Start 2P"'
export const FONT_BODY = '"VT323"'
