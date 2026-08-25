import { useEffect, useState } from 'react'
import { findOngoingClasses, minutesToClock } from './lib/geo'
import type { ClassWindow } from './lib/geo'
import { attendDemoState } from './lib/attendDemoState'
import './AttendConsole.css'

const DEMO_CLASSES: ClassWindow[] = [
  { id: '1', name: 'Data Structures', code: 'CS201', startTime: '09:00', endTime: '09:50' },
  { id: '2', name: 'Databases', code: 'CS305', startTime: '11:00', endTime: '11:50' },
  { id: '3', name: 'Elective \u2014 HCI', code: 'CS410', startTime: '14:00', endTime: '14:50' },
]

const START_MIN = 8 * 60
const END_MIN = 16 * 60

interface Checklist {
  foundOngoing: boolean
  foundGap: boolean
  ranLiveCheck: boolean
}

export function AttendTimetable({ onExit }: { onExit: (completed: boolean) => void }) {
  const [minutes, setMinutes] = useState(9 * 60 + 20)
  const [checklist, setChecklist] = useState<Checklist>({ foundOngoing: false, foundGap: false, ranLiveCheck: false })
  const [liveResult, setLiveResult] = useState<string | null>(null)

  const clock = minutesToClock(minutes)
  const ongoing = findOngoingClasses(DEMO_CLASSES, clock)
  const done = checklist.foundOngoing && checklist.foundGap && checklist.ranLiveCheck

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit(done)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  useEffect(() => {
    if (ongoing.length > 0) setChecklist((prev) => (prev.foundOngoing ? prev : { ...prev, foundOngoing: true }))
    else setChecklist((prev) => (prev.foundGap ? prev : { ...prev, foundGap: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock])

  function runLiveCheck() {
    const cls = ongoing[0]
    let result: string
    if (!cls) {
      result = 'No ongoing class right now \u2014 nothing gets recorded, regardless of location.'
    } else if (attendDemoState.inRange) {
      result = `PRESENT \u2014 marked for ${cls.name} (${cls.code}). In range and in session.`
    } else {
      result = `ABSENT \u2014 marked for ${cls.name} (${cls.code}). In session, but out of range.`
    }
    setLiveResult(result)
    setChecklist((prev) => ({ ...prev, ranLiveCheck: true }))
  }

  return (
    <div className="ac2-backdrop" onClick={() => onExit(done)}>
      <div className="ac2-panel" role="dialog" aria-modal="true" aria-label="Standing Window Console" onClick={(e) => e.stopPropagation()}>
        <div className="ac2-header">
          <span>THE STANDING WINDOW — being there isn't enough</span>
          <button className="ac2-close" onClick={() => onExit(done)}>
            CLOSE
          </button>
        </div>

        <div className="ac2-body">
          <div className="ac2-map-col">
            <div className="ac2-clock">{clock}</div>
            <input
              type="range"
              min={START_MIN}
              max={END_MIN}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="ac2-slider ac2-clock-slider"
            />
            <div className="ac2-timetable">
              {DEMO_CLASSES.map((c) => {
                const active = ongoing.some((o) => o.id === c.id)
                return (
                  <div className={`ac2-class-row ${active ? 'active' : ''}`} key={c.id}>
                    <span>
                      {c.name} <em>({c.code})</em>
                    </span>
                    <span>
                      {c.startTime}–{c.endTime}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="ac2-info-col">
            <div className={`ac2-status ${ongoing.length ? 'in' : 'out'}`}>
              {ongoing.length ? `Ongoing: ${ongoing[0].name}` : 'No class in session'}
            </div>

            <div className="ac2-checklist">
              <div className={checklist.foundOngoing ? 'done' : ''}>{checklist.foundOngoing ? '\u2713' : '\u25CB'} Find a moment inside a class window</div>
              <div className={checklist.foundGap ? 'done' : ''}>{checklist.foundGap ? '\u2713' : '\u25CB'} Find a moment with no class running</div>
              <div className={checklist.ranLiveCheck ? 'done' : ''}>{checklist.ranLiveCheck ? '\u2713' : '\u25CB'} Run a live combined check</div>
            </div>

            <button className="ac2-check-btn" onClick={runLiveCheck}>
              Run Live Check (location + time)
            </button>
            {liveResult && <div className="ac2-live-result">{liveResult}</div>}

            {done && (
              <button className="ac2-advance-btn" onClick={() => onExit(true)}>
                Anchor the Signal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
