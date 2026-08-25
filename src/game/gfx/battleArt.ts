import Phaser from 'phaser'

function shade(hex: string, percent: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  let r = (n >> 16) & 0xff
  let g = (n >> 8) & 0xff
  let b = n & 0xff
  const amt = Math.round(2.55 * percent)
  r = Math.max(0, Math.min(255, r + amt))
  g = Math.max(0, Math.min(255, g + amt))
  b = Math.max(0, Math.min(255, b + amt))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export type CrestStyle = 'bars' | 'flow' | 'bug' | 'book'

/** Generates a small shield-shaped crest texture with a symbol matching the battle's theme. */
export function generateCrestTexture(scene: Phaser.Scene, key: string, accent: string, style: CrestStyle): string {
  const texKey = `crest-${key}`
  if (scene.textures.exists(texKey)) return texKey

  const size = 64
  const tex = scene.textures.createCanvas(texKey, size, size)!
  const ctx = tex.getContext()
  ctx.imageSmoothingEnabled = false

  const dark = shade(accent, -28)
  const light = '#f4e9d8'

  // shield body
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.moveTo(8, 6)
  ctx.lineTo(56, 6)
  ctx.lineTo(56, 32)
  ctx.quadraticCurveTo(56, 48, 32, 60)
  ctx.quadraticCurveTo(8, 48, 8, 32)
  ctx.closePath()
  ctx.fill()

  ctx.lineWidth = 3
  ctx.strokeStyle = dark
  ctx.stroke()

  ctx.fillStyle = light
  ctx.strokeStyle = light
  ctx.lineWidth = 2.5

  if (style === 'bars') {
    ctx.fillRect(19, 34, 6, 15)
    ctx.fillRect(29, 25, 6, 24)
    ctx.fillRect(39, 17, 6, 32)
  } else if (style === 'flow') {
    ;[[17, 30], [30, 22], [43, 30]].forEach(([x, y]) => ctx.fillRect(x, y, 6, 6))
    ctx.beginPath()
    ctx.moveTo(20, 33)
    ctx.lineTo(33, 25)
    ctx.lineTo(46, 33)
    ctx.stroke()
  } else if (style === 'bug') {
    ctx.beginPath()
    ctx.ellipse(32, 33, 11, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = dark
    ctx.lineWidth = 2
    ;[[-14, -6], [14, -6], [-16, 4], [16, 4], [-13, 14], [13, 14]].forEach(([dx, dy]) => {
      ctx.beginPath()
      ctx.moveTo(32, 33)
      ctx.lineTo(32 + dx, 33 + dy)
      ctx.stroke()
    })
    ctx.fillStyle = dark
    ctx.fillRect(27, 22, 3, 3)
    ctx.fillRect(35, 22, 3, 3)
  } else if (style === 'book') {
    ctx.fillRect(18, 20, 28, 24)
    ctx.strokeStyle = dark
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(32, 20)
    ctx.lineTo(32, 44)
    ctx.stroke()
    ctx.strokeStyle = accent
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(21, 27)
    ctx.lineTo(29, 27)
    ctx.moveTo(21, 32)
    ctx.lineTo(29, 32)
    ctx.moveTo(35, 27)
    ctx.lineTo(43, 27)
    ctx.moveTo(35, 32)
    ctx.lineTo(43, 32)
    ctx.stroke()
  }

  tex.refresh()
  return texKey
}
