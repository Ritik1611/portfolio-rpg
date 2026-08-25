import { useEffect, useMemo, useState } from 'react'
import './ChronoTerminal.css'
import './ArchitectureConsole.css'

interface Node {
  id: string
  label: string
  service: string
  detail: string
  color: string
  requires: string[]
  track: 'A' | 'B'
}

const NODES: Node[] = [
  { id: 'cloudwatch', label: 'CloudWatch', service: 'AWS CloudWatch', detail: 'Monitor for changes & system health', color: '#3f9a4b', requires: [], track: 'A' },
  { id: 'lock', label: 'Lock', service: 'AWS Security Group', detail: 'Lock down the perimeter', color: '#e08a3c', requires: ['cloudwatch'], track: 'A' },
  { id: 'backup', label: 'Backup', service: 'AWS Backup', detail: 'Trigger recovery if something breaks', color: '#3f9a4b', requires: ['lock'], track: 'A' },
  { id: 'ebs', label: 'EBS', service: 'AWS EBS', detail: 'Save work to the local volume', color: '#d9534f', requires: [], track: 'B' },
  { id: 's3', label: 'S3', service: 'AWS S3', detail: 'Sync to S3 with automatic backup', color: '#3f9a4b', requires: ['ebs'], track: 'B' },
  { id: 'sysmanager', label: 'Sys Manager', service: 'AWS Systems Manager', detail: 'Sync state to the cloud VM', color: '#c2408c', requires: ['s3'], track: 'B' },
  { id: 'ec2', label: 'EC2', service: 'AWS EC2', detail: 'Create the cloud VM', color: '#e08a3c', requires: ['sysmanager'], track: 'B' },
  { id: 'workspaces', label: 'Workspaces', service: 'AWS Workspaces', detail: 'Resume work on the cloud', color: '#2f8f8f', requires: ['ec2'], track: 'B' },
  { id: 'datasync', label: 'DataSync', service: 'AWS DataSync', detail: 'Sync finished work back to local', color: '#2f8f8f', requires: ['workspaces'], track: 'B' },
]

export function ArchitectureConsole({ onExit }: { onExit: (completed: boolean) => void }) {
  const [active, setActive] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const trackA = useMemo(() => NODES.filter((n) => n.track === 'A'), [])
  const trackB = useMemo(() => NODES.filter((n) => n.track === 'B'), [])
  const allDone = active.size === NODES.length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit(allDone)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone])

  function activate(node: Node) {
    if (active.has(node.id)) return
    const missing = node.requires.filter((r) => !active.has(r))
    if (missing.length > 0) {
      const missingLabels = NODES.filter((n) => missing.includes(n.id)).map((n) => n.service)
      setError(`${node.service} needs ${missingLabels.join(', ')} online first.`)
      return
    }
    setError(null)
    setActive((prev) => new Set(prev).add(node.id))
  }

  return (
    <div className="ct-backdrop" onClick={() => onExit(allDone)}>
      <div className="ac-panel" role="dialog" aria-modal="true" aria-label="Architecture Console" onClick={(e) => e.stopPropagation()}>
        <div className="ct-header">
          <span>ARCHITECTURE CONSOLE — bring the real pipeline online</span>
          <button className="ct-close" onClick={() => onExit(allDone)}>
            CLOSE
          </button>
        </div>

        <div className="ac-body">
          <p className="ac-intro">
            This is ChronoCLI's actual AWS architecture. Click each service online, in dependency order — the console
            will tell you what's missing if you jump ahead.
          </p>

          <div className="ac-track">
            <div className="ac-track-title">Security &amp; Monitoring</div>
            <div className="ac-nodes">
              {trackA.map((n, i) => (
                <NodeButton key={n.id} node={n} isActive={active.has(n.id)} onClick={() => activate(n)} showArrow={i < trackA.length - 1} />
              ))}
            </div>
          </div>

          <div className="ac-track">
            <div className="ac-track-title">Save &amp; Cloud Sync</div>
            <div className="ac-nodes">
              {trackB.map((n, i) => (
                <NodeButton key={n.id} node={n} isActive={active.has(n.id)} onClick={() => activate(n)} showArrow={i < trackB.length - 1} />
              ))}
            </div>
          </div>

          {error && <div className="ac-error">{error}</div>}

          {allDone ? (
            <div className="ac-complete">
              <div className="ac-complete-title">✓ Pipeline online. Timeline fully stabilized.</div>
              <button className="ct-return-btn" onClick={() => onExit(true)}>
                Return to the Vault
              </button>
            </div>
          ) : (
            <div className="ac-progress">
              {active.size} / {NODES.length} services online
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NodeButton({ node, isActive, onClick, showArrow }: { node: Node; isActive: boolean; onClick: () => void; showArrow: boolean }) {
  return (
    <>
      <button className={`ac-node ${isActive ? 'active' : ''}`} style={{ borderColor: node.color }} onClick={onClick}>
        <span className="ac-node-dot" style={{ background: isActive ? node.color : 'transparent', borderColor: node.color }} />
        <span className="ac-node-label">{node.label}</span>
        <span className="ac-node-detail">{node.detail}</span>
      </button>
      {showArrow && <span className="ac-arrow">→</span>}
    </>
  )
}
