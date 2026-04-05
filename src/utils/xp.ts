import type { LogEntry } from '@/types'
import { getPostsForDate, getToday } from './dates'

export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 1.0   // x2 total
  if (streak >= 14) return 0.75  // +75%
  if (streak >= 7) return 0.5    // +50%
  if (streak >= 3) return 0.25   // +25%
  return 0
}

export function getComboMultiplier(postsToday: number): number {
  if (postsToday >= 4) return 2.5
  if (postsToday === 3) return 2.0
  if (postsToday === 2) return 1.5
  return 1.0
}

export function getComboLabel(postsToday: number): string {
  if (postsToday >= 4) return 'x2.5 COMBO'
  if (postsToday === 3) return 'x2.0 COMBO'
  if (postsToday === 2) return 'x1.5 COMBO'
  return ''
}

export function calculateXp(
  baseXp: number,
  streak: number,
  postsToday: number,
  dailyQuestBonus: boolean = false
): { base: number; streakBonus: number; comboBonus: number; questBonus: number; total: number } {
  const streakMult = getStreakBonus(streak)
  const comboMult = getComboMultiplier(postsToday)
  const streakBonus = Math.floor(baseXp * streakMult)
  const comboBonus = postsToday >= 2 ? Math.floor(baseXp * (comboMult - 1)) : 0
  const questBonus = dailyQuestBonus ? 15 : 0
  const total = baseXp + streakBonus + comboBonus + questBonus
  return { base: baseXp, streakBonus, comboBonus, questBonus, total }
}

export function applyPenalty(currentXp: number): number {
  return Math.max(0, Math.floor(currentXp * 0.9))
}

export function getPenaltyAmount(currentXp: number): number {
  return Math.floor(currentXp * 0.1)
}

export function getPostsToday(log: LogEntry[]): number {
  return getPostsForDate(log, getToday()).length
}
