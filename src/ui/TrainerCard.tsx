import { useEffect, useRef } from 'react'
import { useUIStore } from '../store/gameStore'
import { PROFILE } from '../data/profile'
import './Modal.css'
import './TrainerCard.css'

function SkillList({ skills, levels }: { skills: string[]; levels: Record<string, number> }) {
  return (
    <span className="tc-skill-values">
      {skills.map((s, i) => {
        const lvl = levels[s] ?? 1
        return (
          <span key={s}>
            {i > 0 && ', '}
            {s}
            {lvl > 1 && <span className="tc-skill-level"> Lv.{lvl}</span>}
          </span>
        )
      })}
    </span>
  )
}

export function TrainerCard() {
  const close = useUIStore((s) => s.closeTrainerCard)
  const save = useUIStore((s) => s.saveSnapshot)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const levels = save?.skillLevels ?? {}

  useEffect(() => {
    closeBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const initials = PROFILE.name
    .split(' ')
    .map((p) => p[0])
    .join('')

  return (
    <div className="modal-backdrop" onClick={close}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Trainer Card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span>TRAINER CARD</span>
          <button ref={closeBtnRef} className="modal-close" onClick={close}>
            CLOSE
          </button>
        </div>

        <div className="modal-body">
          <div className="tc-top">
            <div className="tc-avatar" aria-hidden="true">
              {initials}
            </div>
            <div>
              <div className="tc-name">{PROFILE.name}</div>
              <div className="tc-title">
                {PROFILE.title} · {PROFILE.tagline}
              </div>
              <div className="tc-meta">{PROFILE.location}</div>
              {save && (
                <div className="tc-meta" style={{ color: 'var(--moss-green)', marginTop: 4 }}>
                  {save.badges.length} badge{save.badges.length === 1 ? '' : 's'} earned
                  {save.debugPoints > 0 ? ` \u00b7 ${save.debugPoints} bugs squashed` : ''}
                </div>
              )}
            </div>
          </div>

          <div className="tc-section">
            <span className="tc-section-title">Badges · Certifications</span>
            <div className="tc-badges">
              {PROFILE.certifications.map((c) => (
                <div className="tc-badge" key={c.name}>
                  <span className="tc-badge-icon">◆</span>
                  <span>
                    {c.name} <span style={{ color: 'var(--steel-grey)' }}>· {c.issuer} {c.year}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="tc-section">
            <span className="tc-section-title">Education</span>
            {PROFILE.education.map((e) => (
              <div className="tc-timeline-item" key={e.institution}>
                <span className="tc-timeline-years">{e.years}</span>
                <span>
                  {e.detail} — {e.institution}
                </span>
                <span className="tc-timeline-result">{e.result}</span>
              </div>
            ))}
          </div>

          <div className="tc-section">
            <span className="tc-section-title">Party · Projects</span>
            {PROFILE.projects.map((p) => (
              <div className="tc-project" key={p.id}>
                <div className="tc-project-head">
                  <span className="tc-project-name">{p.codename}</span>
                  <span className="tc-project-type">{p.type}</span>
                </div>
                <div className="tc-project-title">{p.title}</div>
                {save?.projectsFound.includes(p.id) && (
                  <div className="tc-found-row">
                    <span className="tc-found-tag">✓ Found in-game</span>
                    {p.archive && (
                      <button className="tc-archive-btn" onClick={() => useUIStore.getState().openArchive(p.id)}>
                        View Archive
                      </button>
                    )}
                  </div>
                )}
                <div className="tc-project-stack">
                  {p.stack.map((s) => (
                    <span className="tc-chip" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
                <ul className="tc-project-bullets">
                  {p.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="tc-section">
            <span className="tc-section-title">Gym Battles · Experience</span>
            {PROFILE.employment.map((job) => (
              <div className="tc-job" key={job.org + job.period}>
                <div className="tc-job-head">
                  <span className="tc-job-role">
                    {job.role}, {job.org}
                  </span>
                  <span className="tc-job-period">{job.period}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--steel-grey)' }}>
                  {job.location}
                </div>
                <ul className="tc-job-bullets">
                  {job.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="tc-section">
            <span className="tc-section-title">Inventory · Skills</span>
            <div className="tc-skill-group">
              <span className="tc-skill-label">Languages</span>
              <SkillList skills={PROFILE.skills.languages} levels={levels} />
            </div>
            <div className="tc-skill-group">
              <span className="tc-skill-label">Frameworks</span>
              <SkillList skills={PROFILE.skills.frameworks} levels={levels} />
            </div>
            <div className="tc-skill-group">
              <span className="tc-skill-label">Libraries</span>
              <SkillList skills={PROFILE.skills.libraries} levels={levels} />
            </div>
            <div className="tc-skill-group">
              <span className="tc-skill-label">Databases</span>
              <SkillList skills={PROFILE.skills.databases} levels={levels} />
            </div>
            <div className="tc-skill-group">
              <span className="tc-skill-label">Tools</span>
              <SkillList skills={PROFILE.skills.tools} levels={levels} />
            </div>
            <div className="tc-skill-group">
              <span className="tc-skill-label">Soft Skills</span>
              <SkillList skills={PROFILE.skills.soft} levels={levels} />
            </div>
          </div>

          <div className="tc-actions">
            <a className="tc-btn" href={PROFILE.resumeFile} download>
              Download Resume
            </a>
            <a className="tc-btn secondary" href={PROFILE.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="tc-btn secondary" href={PROFILE.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="tc-btn secondary" href={`mailto:${PROFILE.email}`}>
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
