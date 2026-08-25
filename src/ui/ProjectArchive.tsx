import { useEffect, useRef } from 'react'
import { useUIStore } from '../store/gameStore'
import { PROFILE } from '../data/profile'
import './Modal.css'
import './ProjectArchive.css'

export function ProjectArchive() {
  const projectId = useUIStore((s) => s.archiveProjectId)
  const close = useUIStore((s) => s.closeArchive)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const project = PROFILE.projects.find((p) => p.id === projectId)

  useEffect(() => {
    closeBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  if (!project) return null
  const archive = project.archive

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal-panel archive-panel" role="dialog" aria-modal="true" aria-label="Project Archive" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>ARCHIVE DECRYPTED</span>
          <button ref={closeBtnRef} className="modal-close" onClick={close}>
            CLOSE
          </button>
        </div>

        <div className="modal-body">
          <div className="archive-title">{project.codename}</div>
          <div className="archive-subtitle">{project.title}</div>

          {archive ? (
            <>
              <div className="tc-section">
                <span className="tc-section-title">Tech Stack</span>
                <div className="archive-chips">
                  {archive.techStack.map((t) => (
                    <span className="tc-chip" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="tc-section">
                <span className="tc-section-title">What It Actually Does</span>
                <ul className="archive-features">
                  {archive.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>

              {archive.diagramSrc && (
                <div className="tc-section">
                  <span className="tc-section-title">Real Architecture Diagram</span>
                  <img className="archive-diagram" src={archive.diagramSrc} alt={archive.diagramAlt ?? 'Architecture diagram'} />
                </div>
              )}

              {archive.note && <div className="archive-note">{archive.note}</div>}
            </>
          ) : (
            <p className="archive-placeholder">Full breakdown coming soon.</p>
          )}

          <div className="tc-actions">
            {archive?.installerSrc && (
              <a className="tc-btn" href={archive.installerSrc} download>
                {archive.installerLabel ?? 'Download Installer'}
              </a>
            )}
            {project.github && (
              <a className="tc-btn secondary" href={project.github} target="_blank" rel="noreferrer">
                View on GitHub
              </a>
            )}
            <a className="tc-btn secondary" href={`mailto:${PROFILE.email}?subject=${encodeURIComponent(project.codename)}`}>
              Ask About This
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
