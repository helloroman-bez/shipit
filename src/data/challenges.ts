import type { Challenge, GameState } from '@/types'
import { getPostsForDate, getLast7Days } from '@/utils/dates'

export const CHALLENGES: Challenge[] = [
  {
    id: 'weekly',
    name: 'Недельный марафон',
    desc: '7 из 7 дней с публикацией на этой неделе',
    icon: '📅',
    bonusXp: 100,
    progressMax: 7,
    durationDays: 7,
    progressValue: (s) => {
      const days = getLast7Days()
      return days.filter((d) => getPostsForDate(s.log, d).length > 0).length
    },
    check: (s) => {
      const days = getLast7Days()
      return days.every((d) => getPostsForDate(s.log, d).length > 0)
    },
  },
  {
    id: 'format_mix',
    name: 'Формат-микс',
    desc: '5 разных типов контента за неделю',
    icon: '🎨',
    bonusXp: 150,
    progressMax: 5,
    durationDays: 7,
    progressValue: (s) => {
      const days = getLast7Days()
      const types = new Set(
        s.log.filter((l) => days.includes(l.date)).map((l) => l.contentTypeId)
      )
      return Math.min(types.size, 5)
    },
    check: (s) => {
      const days = getLast7Days()
      const types = new Set(
        s.log.filter((l) => days.includes(l.date)).map((l) => l.contentTypeId)
      )
      return types.size >= 5
    },
  },
  {
    id: 'marathon',
    name: 'Марафон 30 дней',
    desc: '30 дней без единого пропуска',
    icon: '🏃',
    bonusXp: 500,
    progressMax: 30,
    durationDays: 30,
    progressValue: (s) => Math.min(s.streak, 30),
    check: (s) => s.streak >= 30,
  },
  {
    id: 'boss_fight',
    name: 'Boss Fight',
    desc: 'Проведи коллаб или прямой эфир',
    icon: '👊',
    bonusXp: 200,
    progressMax: 1,
    progressValue: (s) => Math.min(s.typeCount['collab'] || 0, 1),
    check: (s) => (s.typeCount['collab'] || 0) >= 1,
  },
  {
    id: 'speed_run',
    name: 'Speed Run',
    desc: '3 поста за один день',
    icon: '⚡',
    bonusXp: 75,
    progressMax: 3,
    progressValue: (s: GameState) => {
      const today = new Date().toISOString().split('T')[0]
      return Math.min(getPostsForDate(s.log, today).length, 3)
    },
    check: (s: GameState) => {
      const today = new Date().toISOString().split('T')[0]
      return getPostsForDate(s.log, today).length >= 3
    },
  },
]
