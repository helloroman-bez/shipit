import type { LogEntry } from '@/types'

export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

export function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export function isSameDay(a: string, b: string): boolean {
  return a === b
}

export function getDaysBetween(a: string, b: string): number {
  const dateA = new Date(a)
  const dateB = new Date(b)
  return Math.round(Math.abs(dateB.getTime() - dateA.getTime()) / 86400000)
}

export function getPostsForDate(log: LogEntry[], date: string): LogEntry[] {
  return log.filter((l) => l.date === date)
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  })
}

export function getLast90Days(): string[] {
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (89 - i))
    return d.toISOString().split('T')[0]
  })
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function getWeekDays(): { date: string; dayLabel: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toISOString().split('T')[0],
      dayLabel: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
    }
  })
}

export function isNewDay(lastDate: string | null): boolean {
  if (!lastDate) return true
  return lastDate !== getToday()
}

export function getSeasonEndDate(startDate: string): string {
  const d = new Date(startDate)
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

export function getDaysLeftInSeason(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
}
