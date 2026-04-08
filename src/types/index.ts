export interface ContentType {
  id: string
  name: string
  xp: number
  emoji: string
}

export interface Level {
  level: number
  name: string
  minXp: number
  icon: string
}

export interface Achievement {
  id: string
  name: string
  desc: string
  icon: string
  check: (s: GameState) => boolean
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: string
}

export interface Challenge {
  id: string
  name: string
  desc: string
  icon: string
  bonusXp: number
  check: (s: GameState) => boolean
  progressValue: (s: GameState) => number
  progressMax: number
  durationDays?: number
}

export interface ActiveChallenge {
  challengeId: string
  startedAt: string
  completedAt?: string
}

export interface DailyQuest {
  id: string
  text: string
  contentTypeId?: string
}

export interface RouletteTask {
  id: string
  topic: string
  format: string
  platform: string
  hook: string
  skeleton: string
}

export interface LogEntry {
  id: string
  date: string
  contentTypeId: string
  xpEarned: number
  bonusXp: number
  platform?: string
  reach?: number
  fromRoulette?: boolean
  dailyQuestCompleted?: boolean
}

export interface Idea {
  id: string
  text: string
  createdAt: string
  used: boolean
}

export interface Settings {
  soundEnabled: boolean
  notificationsEnabled: boolean
  vibrateEnabled: boolean
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export interface Season {
  number: number
  startDate: string
  endDate: string
  seasonXp: number
}

export interface GameState {
  version: 'v2'
  totalXp: number
  seasonXp: number
  totalPosts: number
  streak: number
  bestStreak: number
  lastPostDate: string | null
  lastPenaltyDate: string | null
  log: LogEntry[]
  typeCount: Record<string, number>
  platformsUsed: string[]
  unlockedAchievements: UnlockedAchievement[]
  activeChallenges: ActiveChallenge[]
  completedChallenges: string[]
  dailyQuestCompletedDate: string | null
  ideas: Idea[]
  settings: Settings
  season: Season
  rouletteUsedDates: string[]
  onboardingCompleted: boolean
}
