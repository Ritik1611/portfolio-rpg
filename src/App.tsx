import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { createGame } from './game/Game'
import { GAME_WIDTH, GAME_HEIGHT } from './game/config'
import { OverlayManager } from './ui/OverlayManager'
import './App.css'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return
    const game = createGame(containerRef.current)
    gameRef.current = game
    setReady(true)

    return () => {
      game.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <div className="app-shell">
      <div className="device">
        <div
          className="device-screen"
          style={{
            width: 'min(90vw, calc(88vh * (480 / 320)))',
            aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
          }}
        >
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
          <div className="device-scanlines" aria-hidden="true" />
        </div>
        <span className="device-label">RITIK · THE JOURNEY</span>
      </div>
      {ready && <OverlayManager />}
    </div>
  )
}
