import { useEffect, useRef, useState } from 'react'
import { calculateDistance } from './lib/geo'
import { attendDemoState } from './lib/attendDemoState'
import './AttendConsole.css'

const CAMPUS = { lat: 51.507351, lng: -0.127758 } // real demo coordinate from AttendSmart's own mock service
const PANEL_SIZE = 300
const METERS_PER_PIXEL = 1.15
const MAX_OFFSET = PANEL_SIZE / 2 - 10

function pixelOffsetToLatLng(dx: number, dy: number) {
  const dxMeters = dx * METERS_PER_PIXEL
  const dyMeters = -dy * METERS_PER_PIXEL
  const dLat = dyMeters / 111320
  const dLng = dxMeters / (111320 * Math.cos((CAMPUS.lat * Math.PI) / 180))
  return { lat: CAMPUS.lat + dLat, lng: CAMPUS.lng + dLng }
}

interface Checklist {
  placedInside: boolean
  placedOutside: boolean
}

export function AttendPerimeter({ onExit, onAdvance }: { onExit: () => void; onAdvance: () => void }) {
  const [pin, setPin] = useState({ x: 60, y: -40 })
  const [radius, setRadius] = useState(100)
  const [checklist, setChecklist] = useState<Checklist>({ placedInside: false, placedOutside: false })
  const panelRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { lat, lng } = pixelOffsetToLatLng(pin.x, pin.y)
  const distance = calculateDistance(lat, lng, CAMPUS.lat, CAMPUS.lng)
  const inRange = distance <= radius
  const allDone = checklist.placedInside && checklist.placedOutside

  useEffect(() => {
    attendDemoState.distance = distance
    attendDemoState.radius = radius
    attendDemoState.inRange = inRange
    if (inRange) setChecklist((prev) => (prev.placedInside ? prev : { ...prev, placedInside: true }))
    else setChecklist((prev) => (prev.placedOutside ? prev : { ...prev, placedOutside: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distance, radius, inRange])

  function placeAt(clientX: number, clientY: number) {
    const rect = panelRef.current?.getBoundingClientRect()
    if (!rect) return
    let x = clientX - (rect.left + rect.width / 2)
    let y = clientY - (rect.top + rect.height / 2)
    x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, x))
    y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, y))
    setPin({ x, y })
  }

  return (
    <div className="ac2-backdrop" onClick={onExit}>
      <div className="ac2-panel" role="dialog" aria-modal="true" aria-label="Perimeter Console" onClick={(e) => e.stopPropagation()}>
        <div className="ac2-header">
          <span>THE PERIMETER — live geofence, real distance math</span>
          <button className="ac2-close" onClick={onExit}>
            CLOSE
          </button>
        </div>

        <div className="ac2-body">
          <div className="ac2-map-col">
            <div
              className="ac2-map"
              ref={panelRef}
              style={{ width: PANEL_SIZE, height: PANEL_SIZE }}
              onMouseDown={(e) => {
                dragging.current = true
                placeAt(e.clientX, e.clientY)
              }}
              onMouseMove={(e) => dragging.current && placeAt(e.clientX, e.clientY)}
              onMouseUp={() => (dragging.current = false)}
              onMouseLeave={() => (dragging.current = false)}
            >
              <div
                className="ac2-radius"
                style={{ width: (radius / METERS_PER_PIXEL) * 2, height: (radius / METERS_PER_PIXEL) * 2 }}
              />
              <div className="ac2-campus-dot" />
              <div className="ac2-pin" style={{ transform: `translate(${pin.x}px, ${pin.y}px)` }} title="Drag me" />
            </div>
            <div className="ac2-hint">Click or drag inside the field to move your simulated position.</div>
          </div>

          <div className="ac2-info-col">
            <div className="ac2-readout">
              <div className="ac2-readout-label">Distance to campus</div>
              <div className="ac2-readout-value">{distance.toFixed(1)} m</div>
            </div>
            <div className={`ac2-status ${inRange ? 'in' : 'out'}`}>{inRange ? 'PRESENT \u2014 in range' : 'ABSENT \u2014 out of range'}</div>

            <label className="ac2-slider-label">
              Geofence radius: {radius} m
              <input type="range" min={20} max={250} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="ac2-slider" />
            </label>

            <div className="ac2-checklist">
              <div className={checklist.placedInside ? 'done' : ''}>{checklist.placedInside ? '\u2713' : '\u25CB'} Place a pin inside the radius</div>
              <div className={checklist.placedOutside ? 'done' : ''}>{checklist.placedOutside ? '\u2713' : '\u25CB'} Place a pin outside the radius</div>
            </div>

            {allDone && (
              <button className="ac2-advance-btn" onClick={onAdvance}>
                Continue → The Standing Window
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
