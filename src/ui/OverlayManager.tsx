import { useEffect } from 'react'
import { useUIStore } from '../store/gameStore'
import { TrainerCard } from './TrainerCard'
import { SettingsModal } from './SettingsModal'
import { ProjectArchive } from './ProjectArchive'
import { ChronoTerminal } from './ChronoTerminal'
import { ArchitectureConsole } from './ArchitectureConsole'
import { AttendPerimeter } from './AttendPerimeter'
import { AttendTimetable } from './AttendTimetable'

function finishExperience(exitEventName: string, completed: boolean) {
  useUIStore.getState().setDungeonStage(null)
  window.dispatchEvent(new CustomEvent(exitEventName, { detail: { completed } }))
}

export function OverlayManager() {
  const showTrainerCard = useUIStore((s) => s.showTrainerCard)
  const showSettings = useUIStore((s) => s.showSettings)
  const archiveProjectId = useUIStore((s) => s.archiveProjectId)
  const dungeonStage = useUIStore((s) => s.dungeonStage)

  useEffect(() => {
    const onOpenTrainer = () => useUIStore.getState().openTrainerCard()
    const onOpenSettings = () => useUIStore.getState().openSettings()
    const onOpenArchive = (e: Event) => {
      const detail = (e as CustomEvent<{ projectId: string }>).detail
      if (detail?.projectId) useUIStore.getState().openArchive(detail.projectId)
    }
    const onOpenChronoTerminal = () => useUIStore.getState().setDungeonStage('chrono-terminal')
    const onOpenAttendConsole = () => useUIStore.getState().setDungeonStage('attend-perimeter')

    window.addEventListener('open-trainer-card', onOpenTrainer)
    window.addEventListener('open-settings', onOpenSettings)
    window.addEventListener('open-project-archive', onOpenArchive)
    window.addEventListener('open-chrono-terminal', onOpenChronoTerminal)
    window.addEventListener('open-attend-console', onOpenAttendConsole)
    return () => {
      window.removeEventListener('open-trainer-card', onOpenTrainer)
      window.removeEventListener('open-settings', onOpenSettings)
      window.removeEventListener('open-project-archive', onOpenArchive)
      window.removeEventListener('open-chrono-terminal', onOpenChronoTerminal)
      window.removeEventListener('open-attend-console', onOpenAttendConsole)
    }
  }, [])

  return (
    <>
      {showTrainerCard && <TrainerCard />}
      {showSettings && <SettingsModal />}
      {archiveProjectId && <ProjectArchive />}

      {dungeonStage === 'chrono-terminal' && (
        <ChronoTerminal
          onExit={() => finishExperience('chrono-experience-exit', false)}
          onAdvance={() => useUIStore.getState().setDungeonStage('chrono-architecture')}
        />
      )}
      {dungeonStage === 'chrono-architecture' && (
        <ArchitectureConsole onExit={(completed) => finishExperience('chrono-experience-exit', completed)} />
      )}

      {dungeonStage === 'attend-perimeter' && (
        <AttendPerimeter
          onExit={() => finishExperience('attend-experience-exit', false)}
          onAdvance={() => useUIStore.getState().setDungeonStage('attend-timetable')}
        />
      )}
      {dungeonStage === 'attend-timetable' && (
        <AttendTimetable onExit={(completed) => finishExperience('attend-experience-exit', completed)} />
      )}
    </>
  )
}
