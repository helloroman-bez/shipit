import { useState, useEffect, useCallback } from 'react'
import type { GameState, LogEntry, Settings, Idea } from '@/types'
import { CONTENT_TYPES } from '@/data/contentTypes'
import { ACHIEVEMENTS } from '@/data/achievements'
import { CHALLENGES } from '@/data/challenges'
import { getToday, getYesterday, getDaysBetween, getSeasonEndDate } from '@/utils/dates'
import { calculateXp, applyPenalty, getPenaltyAmount, getPostsToday } from '@/utils/xp'

const STORAGE_KEY = 'ship_it_v2'
const STORAGE_KEY_V1 = 'ship_it_v1'

function getDefaultState(): GameState {
  const today = getToday()
  return {
    version: 'v2',
    totalXp: 0,
    seasonXp: 0,
    totalPosts: 0,
    streak: 0,
    bestStreak: 0,
    lastPostDate: null,
    lastPenaltyDate: null,
    log: [],
    typeCount: {},
    platformsUsed: [],
    unlockedAchievements: [],
    activeChallenges: [],
    completedChallenges: [],
    dailyQuestCompletedDate: null,
    ideas: [],
    settings: { soundEnabled: true, notificationsEnabled: false, vibrateEnabled: true },
    season: { number: 1, startDate: today, endDate: getSeasonEndDate(today), seasonXp: 0 },
    rouletteUsedDates: [],
    onboardingCompleted: false,
  }
}

function migrateFromV1(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1)
    if (!raw) return null
    const v1 = JSON.parse(raw)
    const base = getDefaultState()
    const migrated: GameState = {
      ...base,
      totalXp: v1.totalXp || 0,
      seasonXp: v1.totalXp || 0,
      totalPosts: v1.totalPosts || 0,
      streak: v1.streak || 0,
      bestStreak: v1.bestStreak || 0,
      lastPostDate: v1.lastPostDate || null,
      typeCount: (() => {
        const tc: Record<string, number> = {}
        if (v1.typeCount) {
          const nameToId: Record<string, string> = {
            'Текстовый пост': 'text', 'Сторис-серия': 'stories',
            'Видео/Рилс': 'video', 'Кейс с цифрами': 'case',
            'Коллаб/эфир': 'collab', 'Мем/юмор': 'meme',
            'Скринкаст/туториал': 'screencast', 'Голосовое/подкаст': 'voice',
          }
          for (const [k, v] of Object.entries(v1.typeCount)) {
            tc[nameToId[k] || k] = v as number
          }
        }
        return tc
      })(),
      platformsUsed: v1.platformsUsed || [],
      unlockedAchievements: (v1.unlockedAchievements || []).map((id: string) => ({
        id, unlockedAt: getToday(),
      })),
      log: (v1.log || []).map((entry: Record<string, unknown>, i: number) => ({
        id: `migrated-${i}`,
        date: entry.date as string,
        contentTypeId: (() => {
          const nameToId: Record<string, string> = {
            'Текстовый пост': 'text', 'Сторис-серия': 'stories',
            'Видео/Рилс': 'video', 'Кейс с цифрами': 'case',
            'Коллаб/эфир': 'collab', 'Мем/юмор': 'meme',
            'Скринкаст/туториал': 'screencast', 'Голосовое/подкаст': 'voice',
          }
          return nameToId[entry.type as string] || 'text'
        })(),
        xpEarned: entry.xp as number || 10,
        bonusXp: entry.bonus as number || 0,
        platform: entry.platform as string | undefined,
      })),
      onboardingCompleted: true,
    }
    localStorage.removeItem(STORAGE_KEY_V1)
    return migrated
  } catch {
    return null
  }
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as GameState
      // Backfill fields added after initial release
      if (parsed.onboardingCompleted === undefined) {
        parsed.onboardingCompleted = parsed.totalPosts > 0
      }
      return parsed
    }
  } catch {}
  const migrated = migrateFromV1()
  if (migrated) return migrated
  return getDefaultState()
}

function applyDailyPenalty(state: GameState): { state: GameState; penaltyAmount: number } {
  const today = getToday()
  const yesterday = getYesterday()
  if (
    state.lastPenaltyDate === today ||
    !state.lastPostDate ||
    state.lastPostDate === today ||
    state.lastPostDate === yesterday
  ) {
    return { state, penaltyAmount: 0 }
  }
  const daysMissed = getDaysBetween(state.lastPostDate, today)
  if (daysMissed <= 1 || state.totalXp === 0) return { state, penaltyAmount: 0 }

  const penaltyAmount = getPenaltyAmount(state.totalXp)
  return {
    penaltyAmount,
    state: {
      ...state,
      totalXp: applyPenalty(state.totalXp),
      streak: 0,
      lastPenaltyDate: today,
    },
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const loaded = loadState()
    const { state: withPenalty } = applyDailyPenalty(loaded)
    return withPenalty
  })
  const [penaltyShown, setPenaltyShown] = useState<number>(0)
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  // Check if penalty applied on load
  useEffect(() => {
    const loaded = loadState()
    const { penaltyAmount } = applyDailyPenalty(loaded)
    if (penaltyAmount > 0) setPenaltyShown(penaltyAmount)
  }, [])

  const checkAchievements = useCallback((newState: GameState): GameState => {
    let updated = { ...newState }
    const unlockedIds = new Set(updated.unlockedAchievements.map((u) => u.id))
    for (const ach of ACHIEVEMENTS) {
      if (!unlockedIds.has(ach.id) && ach.check(updated)) {
        updated = {
          ...updated,
          unlockedAchievements: [
            ...updated.unlockedAchievements,
            { id: ach.id, unlockedAt: getToday() },
          ],
        }
        setTimeout(() => setNewlyUnlocked(ach.id), 300)
      }
    }
    return updated
  }, [])

  const checkChallenges = useCallback((newState: GameState): GameState => {
    let updated = { ...newState }
    for (const ch of CHALLENGES) {
      const isCompleted = updated.completedChallenges.includes(ch.id)
      if (!isCompleted && ch.check(updated)) {
        updated = {
          ...updated,
          totalXp: updated.totalXp + ch.bonusXp,
          seasonXp: updated.seasonXp + ch.bonusXp,
          completedChallenges: [...updated.completedChallenges, ch.id],
        }
      }
    }
    return updated
  }, [])

  const addPost = useCallback((
    contentTypeId: string,
    platform?: string,
    reach?: number,
    fromRoulette?: boolean,
    dailyQuestCompleted?: boolean
  ) => {
    setState((prev) => {
      const today = getToday()
      const ct = CONTENT_TYPES.find((c) => c.id === contentTypeId)
      if (!ct) return prev

      // Streak calculation
      const alreadyPostedToday = prev.lastPostDate === today
      let newStreak = prev.streak
      if (!alreadyPostedToday) {
        const yesterday = getYesterday()
        const isConsecutive = prev.lastPostDate === yesterday || prev.lastPostDate === null
        newStreak = isConsecutive ? prev.streak + 1 : 1
      }

      const postsToday = getPostsToday(prev.log) + 1
      const xpCalc = calculateXp(ct.xp, newStreak, postsToday, dailyQuestCompleted)

      const newEntry: LogEntry = {
        id: Date.now().toString(),
        date: today,
        contentTypeId,
        xpEarned: xpCalc.base,
        bonusXp: xpCalc.streakBonus + xpCalc.comboBonus + xpCalc.questBonus,
        platform,
        reach,
        fromRoulette,
        dailyQuestCompleted,
      }

      const newTypeCount = { ...prev.typeCount }
      newTypeCount[contentTypeId] = (newTypeCount[contentTypeId] || 0) + 1

      const newPlatforms = [...prev.platformsUsed]
      if (platform && !newPlatforms.includes(platform)) newPlatforms.push(platform)

      let newState: GameState = {
        ...prev,
        totalXp: prev.totalXp + xpCalc.total,
        seasonXp: prev.seasonXp + xpCalc.total,
        totalPosts: prev.totalPosts + 1,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        lastPostDate: today,
        typeCount: newTypeCount,
        platformsUsed: newPlatforms,
        dailyQuestCompletedDate: dailyQuestCompleted ? today : prev.dailyQuestCompletedDate,
        log: [newEntry, ...prev.log].slice(0, 200),
      }

      newState = checkAchievements(newState)
      newState = checkChallenges(newState)
      return newState
    })
  }, [checkAchievements, checkChallenges])

  const addIdea = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      ideas: [
        { id: Date.now().toString(), text, createdAt: getToday(), used: false },
        ...prev.ideas,
      ],
    }))
  }, [])

  const markIdeaUsed = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      ideas: prev.ideas.map((i) => i.id === id ? { ...i, used: true } : i),
    }))
  }, [])

  const deleteIdea = useCallback((id: string) => {
    setState((prev) => ({ ...prev, ideas: prev.ideas.filter((i) => i.id !== id) }))
  }, [])

  const updateSettings = useCallback((settings: Partial<Settings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...settings } }))
  }, [])

  const dismissPenalty = useCallback(() => setPenaltyShown(0), [])
  const dismissUnlocked = useCallback(() => setNewlyUnlocked(null), [])

  const resetGame = useCallback(() => {
    const fresh = getDefaultState()
    setState(fresh)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  }, [])

  const completeOnboarding = useCallback(() => {
    setState((prev) => ({ ...prev, onboardingCompleted: true }))
  }, [])

  return {
    state,
    addPost,
    addIdea,
    markIdeaUsed,
    deleteIdea,
    updateSettings,
    resetGame,
    completeOnboarding,
    penaltyShown,
    dismissPenalty,
    newlyUnlocked,
    dismissUnlocked,
  }
}
