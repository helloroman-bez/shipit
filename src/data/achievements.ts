import type { Achievement, GameState } from '@/types'

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first',
    name: 'Первый шаг',
    desc: 'Опубликуй первый пост',
    icon: '🚀',
    check: (s) => s.totalPosts >= 1,
  },
  {
    id: 'streak7',
    name: 'Неделя огня',
    desc: '7 дней подряд',
    icon: '🔥',
    check: (s) => s.streak >= 7,
  },
  {
    id: 'streak30',
    name: 'Несгибаемый',
    desc: '30 дней подряд',
    icon: '💎',
    check: (s) => s.streak >= 30,
  },
  {
    id: 'xp100',
    name: 'Сотня',
    desc: 'Набери 100 XP',
    icon: '💯',
    check: (s) => s.totalXp >= 100,
  },
  {
    id: 'xp500',
    name: 'Полтысячи',
    desc: 'Набери 500 XP',
    icon: '⚡',
    check: (s) => s.totalXp >= 500,
  },
  {
    id: 'case5',
    name: 'Кейсоман',
    desc: '5 кейсов с цифрами',
    icon: '📊',
    check: (s) => (s.typeCount['case'] || 0) >= 5,
  },
  {
    id: 'video10',
    name: 'Видеомейкер',
    desc: '10 видео/рилсов',
    icon: '🎬',
    check: (s) => (s.typeCount['video'] || 0) >= 10,
  },
  {
    id: 'multi3',
    name: 'Мультиплатформа',
    desc: 'Публикуй на 3+ площадках',
    icon: '🌐',
    check: (s) => s.platformsUsed.length >= 3,
  },
  {
    id: 'posts50',
    name: 'Полсотни',
    desc: '50 постов всего',
    icon: '🏆',
    check: (s) => s.totalPosts >= 50,
  },
  {
    id: 'roulette10',
    name: 'Рулеточник',
    desc: 'Выполни 10 заданий рулетки',
    icon: '🎰',
    check: (s) => s.log.filter((l) => l.fromRoulette).length >= 10,
  },
  {
    id: 'night_shipper',
    name: 'Ночной шиппер',
    desc: 'Залогай пост после 23:00',
    icon: '🌙',
    check: (s) =>
      s.log.some((l) => {
        const h = new Date(l.id).getHours()
        return h >= 23
      }),
  },
  {
    id: 'all_formats',
    name: 'Формат-хамелеон',
    desc: 'Все 8 типов контента за месяц',
    icon: '📱',
    check: (s) => {
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      const recentTypes = new Set(
        s.log
          .filter((l) => new Date(l.date) >= monthAgo)
          .map((l) => l.contentTypeId)
      )
      return recentTypes.size >= 8
    },
  },
  {
    id: 'boss_slayer',
    name: 'Boss Slayer',
    desc: '3 коллаба/эфира',
    icon: '🤝',
    check: (s) => (s.typeCount['collab'] || 0) >= 3,
  },
  {
    id: 'daily_warrior',
    name: 'Daily Warrior',
    desc: '7 daily quest подряд',
    icon: '⭐',
    check: (s) => {
      let count = 0
      const sorted = [...s.log].sort((a, b) => b.date.localeCompare(a.date))
      const dates = [...new Set(sorted.map((l) => l.date))]
      for (const date of dates) {
        const hasQuest = s.log.some((l) => l.date === date && l.dailyQuestCompleted)
        if (hasQuest) count++
        else break
      }
      return count >= 7
    },
  },
  {
    id: 'sniper',
    name: 'Снайпер',
    desc: '5 постов с охватом 500+',
    icon: '🎯',
    check: (s) => s.log.filter((l) => (l.reach || 0) >= 500).length >= 5,
  },
]

export function getAchievementProgress(ach: Achievement, s: GameState): { current: number; max: number } | null {
  switch (ach.id) {
    case 'streak7': return { current: Math.min(s.streak, 7), max: 7 }
    case 'streak30': return { current: Math.min(s.streak, 30), max: 30 }
    case 'xp100': return { current: Math.min(s.totalXp, 100), max: 100 }
    case 'xp500': return { current: Math.min(s.totalXp, 500), max: 500 }
    case 'case5': return { current: Math.min(s.typeCount['case'] || 0, 5), max: 5 }
    case 'video10': return { current: Math.min(s.typeCount['video'] || 0, 10), max: 10 }
    case 'multi3': return { current: Math.min(s.platformsUsed.length, 3), max: 3 }
    case 'posts50': return { current: Math.min(s.totalPosts, 50), max: 50 }
    case 'roulette10': return { current: Math.min(s.log.filter((l) => l.fromRoulette).length, 10), max: 10 }
    case 'boss_slayer': return { current: Math.min(s.typeCount['collab'] || 0, 3), max: 3 }
    default: return null
  }
}
