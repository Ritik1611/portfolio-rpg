import Phaser from 'phaser'

export const PORTAL_KEY = 'dungeon-portal'

/** A ring-layered portal texture. Pair with a rotation + pulse tween for the swirl effect. */
export function generatePortalTexture(scene: Phaser.Scene, accent: string): string {
  const key = `${PORTAL_KEY}-${accent.replace('#', '')}`
  if (scene.textures.exists(key)) return key

  const size = 56
  const tex = scene.textures.createCanvas(key, size, size)!
  const ctx = tex.getContext()
  ctx.imageSmoothingEnabled = false

  const cx = size / 2
  const cy = size / 2

  const rings: [number, string, number][] = [
    [26, '#1a1c2c', 1],
    [22, accent, 0.9],
    [17, '#f4e9d8', 0.85],
    [12, accent, 1],
    [6, '#f4e9d8', 1],
  ]

  rings.forEach(([r, color, alpha]) => {
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  })

  // swirl streaks
  ctx.globalAlpha = 0.8
  ctx.strokeStyle = '#f4e9d8'
  ctx.lineWidth = 2
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * 8, cy + Math.sin(angle) * 8)
    ctx.lineTo(cx + Math.cos(angle + 0.8) * 24, cy + Math.sin(angle + 0.8) * 24)
    ctx.stroke()
  }

  ctx.globalAlpha = 1
  tex.refresh()
  return key
}
