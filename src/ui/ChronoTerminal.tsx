import { useEffect, useRef, useState } from 'react'
import { diffLines } from './lib/diff'
import type { DiffLine } from './lib/diff'
import './ChronoTerminal.css'

interface FileVersion {
  content: string
  timestamp: string
}
interface FileState {
  versions: FileVersion[]
  draft: string
}
type Files = Record<string, FileState>

interface Checklist {
  warp1: boolean
  warp2: boolean
  flashback: boolean
  snapshot: boolean
  timejump: boolean
}

interface OutputLine {
  id: number
  text: string
  kind: 'input' | 'output' | 'error' | 'success' | DiffLine['type']
}

const CHECKLIST_LABELS: [keyof Checklist, string][] = [
  ['warp1', 'edit + warp a file (create version 1)'],
  ['warp2', 'edit + warp it again (create version 2)'],
  ['flashback', 'flashback between two versions'],
  ['snapshot', 'snapshot your progress'],
  ['timejump', 'timejump back to an earlier version'],
]

const WELCOME_CONTENT = 'Welcome to ChronoCLI.\nEdit me, then warp me.'

function nowStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function ChronoTerminal({ onExit, onAdvance }: { onExit: () => void; onAdvance: () => void }) {
  const idRef = useRef(0)
  const filesRef = useRef<Files>({
    'welcome.txt': { versions: [{ content: WELCOME_CONTENT, timestamp: nowStr() }], draft: WELCOME_CONTENT },
  })
  const snapshotRef = useRef<Files | null>(null)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(0)
  const completedAnnouncedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [checklist, setChecklist] = useState<Checklist>({
    warp1: false,
    warp2: false,
    flashback: false,
    snapshot: false,
    timejump: false,
  })
  const [log, setLog] = useState<OutputLine[]>([])
  const [input, setInput] = useState('')

  const allDone = Object.values(checklist).every(Boolean)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
    appendLog('Chrono Terminal \u2014 live simulated session.', 'output')
    appendLog('Type "help" for commands. Work through the checklist on the right.', 'output')
    appendLog('', 'output')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [log])

  useEffect(() => {
    if (allDone && !completedAnnouncedRef.current) {
      completedAnnouncedRef.current = true
      appendLog('', 'output')
      appendLog('\u2713 Timeline stabilized. The Vault accepts your changes.', 'success')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone])

  function appendLog(text: string, kind: OutputLine['kind']) {
    setLog((prev) => [...prev, { id: idRef.current++, text, kind }])
  }

  function appendDiff(oldContent: string, newContent: string) {
    diffLines(oldContent, newContent).forEach((d) => {
      const prefix = d.type === 'add' ? '+ ' : d.type === 'remove' ? '- ' : '  '
      appendLog(prefix + d.text, d.type)
    })
  }

  function markDone(key: keyof Checklist) {
    setChecklist((prev) => (prev[key] ? prev : { ...prev, [key]: true }))
  }

  function handleCommand(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return
    appendLog(`chrono> ${trimmed}`, 'input')
    historyRef.current.push(trimmed)
    historyIndexRef.current = historyRef.current.length

    const parts = trimmed.split(' ')
    const cmd = parts[0]
    const rest = parts.slice(1)

    switch (cmd) {
      case 'help': {
        appendLog('Commands:', 'output')
        appendLog('  edit <file> <text...>        stage new content for a file', 'output')
        appendLog('  warp <file>                  commit staged content as a new version', 'output')
        appendLog('  timeline <file>               list versions', 'output')
        appendLog('  flashback <file> <v1> <v2>    diff two versions', 'output')
        appendLog('  timejump <file> <v>           restore a version into the editor', 'output')
        appendLog('  snapshot                      save a full capsule', 'output')
        appendLog('  restore                       restore the last capsule', 'output')
        appendLog('  present                       list tracked files', 'output')
        appendLog('  clear                         clear the screen', 'output')
        appendLog('  exit                          close the terminal', 'output')
        break
      }
      case 'edit': {
        const file = rest[0]
        const content = rest.slice(1).join(' ')
        if (!file || !content) {
          appendLog('Usage: edit <file> <text...>', 'error')
          break
        }
        const f = filesRef.current[file] ?? { versions: [], draft: '' }
        f.draft = content
        filesRef.current = { ...filesRef.current, [file]: f }
        appendLog(`Staged new content for '${file}'. Run "warp ${file}" to commit it.`, 'success')
        break
      }
      case 'warp': {
        const file = rest[0]
        if (!file) {
          appendLog('Usage: warp <file>', 'error')
          break
        }
        const f = filesRef.current[file]
        if (!f) {
          appendLog(`No such file '${file}'. Try "edit ${file} <text>" first.`, 'error')
          break
        }
        const last = f.versions[f.versions.length - 1]
        if (last && last.content === f.draft) {
          appendLog('No changes to warp.', 'output')
          break
        }
        const newVersion: FileVersion = { content: f.draft || last?.content || '', timestamp: nowStr() }
        const prevContent = last?.content
        f.versions = [...f.versions, newVersion]
        filesRef.current = { ...filesRef.current, [file]: f }
        appendLog(`'${file}' warped as version ${f.versions.length}.`, 'success')
        if (prevContent !== undefined) appendDiff(prevContent, newVersion.content)
        if (f.versions.length === 1) markDone('warp1')
        if (f.versions.length >= 2) markDone('warp2')
        break
      }
      case 'timeline': {
        const file = rest[0]
        const f = file ? filesRef.current[file] : undefined
        if (!file || !f) {
          appendLog(`No such file '${file ?? ''}'.`, 'error')
          break
        }
        f.versions.forEach((v, idx) => {
          appendLog(`  v${idx + 1}  ${v.timestamp}  ${v.content.split('\n')[0].slice(0, 30)}`, 'output')
        })
        break
      }
      case 'flashback': {
        const [file, v1, v2] = rest
        const f = file ? filesRef.current[file] : undefined
        if (!f) {
          appendLog(`No such file '${file ?? ''}'.`, 'error')
          break
        }
        const i1 = Number(v1) - 1
        const i2 = Number(v2) - 1
        if (!f.versions[i1] || !f.versions[i2]) {
          appendLog('Invalid version numbers. Try "timeline <file>" first.', 'error')
          break
        }
        appendLog(`Diff v${v1} \u2192 v${v2}:`, 'output')
        appendDiff(f.versions[i1].content, f.versions[i2].content)
        markDone('flashback')
        break
      }
      case 'timejump': {
        const [file, v] = rest
        const f = file ? filesRef.current[file] : undefined
        if (!f) {
          appendLog(`No such file '${file ?? ''}'.`, 'error')
          break
        }
        const idx = Number(v) - 1
        if (!f.versions[idx]) {
          appendLog('Invalid version number.', 'error')
          break
        }
        f.draft = f.versions[idx].content
        filesRef.current = { ...filesRef.current, [file]: f }
        appendLog(`'${file}' restored to version ${v} in the editor. Run "warp ${file}" to keep it.`, 'success')
        markDone('timejump')
        break
      }
      case 'snapshot': {
        snapshotRef.current = JSON.parse(JSON.stringify(filesRef.current))
        appendLog('Capsule created. Current state saved.', 'success')
        markDone('snapshot')
        break
      }
      case 'restore': {
        if (!snapshotRef.current) {
          appendLog('"No snapshot found. Please create one first."', 'error')
          break
        }
        filesRef.current = JSON.parse(JSON.stringify(snapshotRef.current))
        appendLog('Capsule restored.', 'success')
        break
      }
      case 'present': {
        const names = Object.keys(filesRef.current)
        if (names.length === 0) {
          appendLog('No files tracked yet.', 'output')
          break
        }
        names.forEach((n) => appendLog(`  ${n}  (${filesRef.current[n].versions.length} version[s])`, 'output'))
        break
      }
      case 'clear': {
        setLog([])
        break
      }
      case 'exit': {
        onExit()
        break
      }
      default:
        appendLog(`Unknown command: ${cmd}. Type "help" for a list.`, 'error')
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleCommand(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndexRef.current > 0) {
        historyIndexRef.current -= 1
        setInput(historyRef.current[historyIndexRef.current] ?? '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyIndexRef.current += 1
        setInput(historyRef.current[historyIndexRef.current] ?? '')
      } else {
        historyIndexRef.current = historyRef.current.length
        setInput('')
      }
    }
  }

  return (
    <div className="ct-backdrop" onClick={onExit}>
      <div className="ct-panel" role="dialog" aria-modal="true" aria-label="Chrono Terminal" onClick={(e) => e.stopPropagation()}>
        <div className="ct-header">
          <span>CHRONO TERMINAL — live simulated session</span>
          <button className="ct-close" onClick={onExit}>
            CLOSE
          </button>
        </div>

        <div className="ct-body">
          <div className="ct-checklist">
            <div className="ct-checklist-title">Objectives</div>
            {CHECKLIST_LABELS.map(([key, label]) => (
              <div className={`ct-checklist-item ${checklist[key] ? 'done' : ''}`} key={key}>
                {checklist[key] ? '\u2713' : '\u25CB'} {label}
              </div>
            ))}
            {allDone && (
              <button className="ct-return-btn" onClick={onAdvance}>
                Continue → Architecture Console
              </button>
            )}
          </div>

          <div className="ct-console">
            <div className="ct-output" ref={scrollRef}>
              {log.map((line) => (
                <div key={line.id} className={`ct-line ct-${line.kind}`}>
                  {line.text || '\u00a0'}
                </div>
              ))}
            </div>
            <div className="ct-input-row">
              <span className="ct-prompt">chrono&gt;</span>
              <input
                ref={inputRef}
                className="ct-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
