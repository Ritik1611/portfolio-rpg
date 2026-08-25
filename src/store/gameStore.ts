import { create } from 'zustand'
import type { SaveData } from '../game/config'

interface UIStore {
  showTrainerCard: boolean
  showSettings: boolean
  archiveProjectId: string | null
  dungeonStage: string | null
  saveSnapshot: SaveData | null
  openTrainerCard: () => void
  closeTrainerCard: () => void
  openSettings: () => void
  closeSettings: () => void
  openArchive: (projectId: string) => void
  closeArchive: () => void
  setDungeonStage: (stage: string | null) => void
  updateSaveSnapshot: (save: SaveData) => void
}

export const useUIStore = create<UIStore>((set) => ({
  showTrainerCard: false,
  showSettings: false,
  archiveProjectId: null,
  dungeonStage: null,
  saveSnapshot: null,
  openTrainerCard: () => set({ showTrainerCard: true }),
  closeTrainerCard: () => set({ showTrainerCard: false }),
  openSettings: () => set({ showSettings: true }),
  closeSettings: () => set({ showSettings: false }),
  openArchive: (projectId) => set({ archiveProjectId: projectId }),
  closeArchive: () => set({ archiveProjectId: null }),
  setDungeonStage: (stage) => set({ dungeonStage: stage }),
  updateSaveSnapshot: (save) => set({ saveSnapshot: { ...save } }),
}))
