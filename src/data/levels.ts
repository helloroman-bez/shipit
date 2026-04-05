import type { Level } from '@/types'

export const LEVELS: Level[] = [
  { level: 1, name: 'Новичок', minXp: 0, icon: '🌱' },
  { level: 2, name: 'Контент-боец', minXp: 50, icon: '⚔️' },
  { level: 3, name: 'Охотник за лидами', minXp: 150, icon: '🎯' },
  { level: 4, name: 'Мастер воронок', minXp: 350, icon: '🌀' },
  { level: 5, name: 'Архитектор систем', minXp: 600, icon: '🏗️' },
  { level: 6, name: 'Мастер спиралей', minXp: 1000, icon: '🔮' },
  { level: 7, name: 'Легенда Ship It', minXp: 1500, icon: '👑' },
]

export function getLevelForXp(xp: number): Level {
  let lvl = LEVELS[0]
  for (const l of LEVELS) {
    if (xp >= l.minXp) lvl = l
  }
  return lvl
}

export function getNextLevel(xp: number): Level | null {
  for (const l of LEVELS) {
    if (xp < l.minXp) return l
  }
  return null
}

export function getLevelProgress(xp: number): number {
  const current = getLevelForXp(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  return ((xp - current.minXp) / (next.minXp - current.minXp)) * 100
}
