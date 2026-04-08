import type { TelegramUser } from '@/types'

const TELEGRAM_AUTH_KEY = 'ship_it_tg_auth'

export function loadTelegramUser(): TelegramUser | null {
  try {
    const raw = localStorage.getItem(TELEGRAM_AUTH_KEY)
    if (!raw) return null
    return JSON.parse(raw) as TelegramUser
  } catch {
    return null
  }
}

export function saveTelegramUser(user: TelegramUser): void {
  localStorage.setItem(TELEGRAM_AUTH_KEY, JSON.stringify(user))
}

export function clearTelegramUser(): void {
  localStorage.removeItem(TELEGRAM_AUTH_KEY)
}

export const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined
export const isTelegramLoginEnabled = Boolean(TELEGRAM_BOT_USERNAME)
