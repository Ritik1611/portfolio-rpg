import { useEffect, useRef } from 'react'
import { useUIStore } from '../store/gameStore'
import { clearSave } from '../game/config'
import './Modal.css'

export function SettingsModal() {
  const close = useUIStore((s) => s.closeSettings)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const handleReset = () => {
    if (confirm('Reset your save data? This clears your name and progress.')) {
      clearSave()
      window.location.reload()
    }
  }

  return (
    <div className="modal-backdrop" onClick={close}>
      <div
        className="modal-panel"
        style={{ maxWidth: 360 }}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span>SETTINGS</span>
          <button ref={closeBtnRef} className="modal-close" onClick={close}>
            CLOSE
          </button>
        </div>
        <div className="modal-body" style={{ fontFamily: 'var(--font-body)', fontSize: 16 }}>
          <p style={{ marginBottom: 14 }}>
            Music and sound options arrive with Phase 2, once the world has anything to make noise.
          </p>
          <button
            className="tc-btn secondary"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 10,
              border: '3px solid var(--ink-navy)',
              padding: '10px 12px',
              cursor: 'pointer',
            }}
            onClick={handleReset}
          >
            Reset Save Data
          </button>
        </div>
      </div>
    </div>
  )
}
