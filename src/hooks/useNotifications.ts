import { useCallback, useEffect, useRef } from 'react'

export function useNotifications(enabled: boolean, streak: number, postedToday: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  const cancelReminder = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const scheduleReminder = useCallback(() => {
    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return
    cancelReminder()

    const now = new Date()
    const target = new Date()
    target.setHours(21, 0, 0, 0)
    if (now >= target) return

    const delay = target.getTime() - now.getTime()
    timerRef.current = setTimeout(() => {
      if (!postedToday) {
        new Notification('Ship It ⚡', {
          body: streak > 0
            ? `Стрик ${streak} дней — не сломай! Залогай пост сегодня.`
            : 'Daily quest ждёт — +15 XP. Залогай пост!',
          icon: '/icons/icon-192.png',
        })
      }
    }, delay)
  }, [enabled, streak, postedToday, cancelReminder])

  useEffect(() => {
    if (postedToday) {
      cancelReminder()
    } else {
      scheduleReminder()
    }
    return cancelReminder
  }, [postedToday, scheduleReminder, cancelReminder])

  return { requestPermission }
}
