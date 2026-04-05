import type { GameState } from '@/types'
import { getLevelForXp } from '@/data/levels'

export async function generateShareCard(state: GameState): Promise<void> {
  const dpr = window.devicePixelRatio || 1
  const W = 1200
  const H = 630
  const canvas = document.createElement('canvas')
  canvas.width = W * dpr
  canvas.height = H * dpr
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  // Load font
  try {
    const font = new FontFace('JetBrains Mono', 'url(https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjOVmNeW8.woff2)')
    await font.load()
    document.fonts.add(font)
  } catch {}

  // Background
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, W, H)

  // Grid pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  const level = getLevelForXp(state.totalXp)

  // Title
  ctx.font = '800 48px "JetBrains Mono", monospace'
  ctx.fillStyle = '#e2c044'
  ctx.fillText('SHIP IT', 80, 100)

  ctx.font = '400 18px "JetBrains Mono", monospace'
  ctx.fillStyle = '#555'
  ctx.fillText('ship every day', 80, 130)

  // Level badge
  ctx.font = '72px serif'
  ctx.fillText(level.icon, 80, 250)
  ctx.font = '700 36px "JetBrains Mono", monospace'
  ctx.fillStyle = '#e8e6e1'
  ctx.fillText(level.name, 170, 230)
  ctx.font = '400 20px "JetBrains Mono", monospace'
  ctx.fillStyle = '#666'
  ctx.fillText(`Уровень ${level.level}`, 170, 260)

  // Stats
  const stats = [
    { label: 'XP', value: state.totalXp.toString() },
    { label: 'СТРИК', value: `${state.streak} дн.` },
    { label: 'ПОСТОВ', value: state.totalPosts.toString() },
    { label: 'ЛУЧШИЙ', value: `${state.bestStreak} дн.` },
  ]

  stats.forEach((s, i) => {
    const x = 80 + i * 270
    const y = 350
    ctx.fillStyle = '#111118'
    roundRect(ctx, x, y, 240, 120, 12)
    ctx.fill()
    ctx.strokeStyle = '#1a1a24'
    ctx.lineWidth = 1
    roundRect(ctx, x, y, 240, 120, 12)
    ctx.stroke()

    ctx.font = '800 40px "JetBrains Mono", monospace'
    ctx.fillStyle = '#e2c044'
    ctx.fillText(s.value, x + 20, y + 65)
    ctx.font = '400 12px "JetBrains Mono", monospace'
    ctx.fillStyle = '#555'
    ctx.letterSpacing = '2px'
    ctx.fillText(s.label, x + 20, y + 95)
  })

  // Achievements
  const unlocked = state.unlockedAchievements.slice(0, 6)
  ctx.font = '400 14px "JetBrains Mono", monospace'
  ctx.fillStyle = '#555'
  ctx.fillText('ДОСТИЖЕНИЯ', 80, 510)

  // Download
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shipit-stats-${new Date().toISOString().split('T')[0]}.png`
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
