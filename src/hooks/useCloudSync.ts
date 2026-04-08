import { useCallback, useRef } from 'react'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { GameState } from '@/types'

const USER_ID_KEY = 'ship_it_user_id'

export function getOrCreateUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

export function useCloudSync() {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveToCloud = useCallback((state: GameState, syncKey: string) => {
    if (!isSupabaseEnabled || !supabase) return
    const client = supabase

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      await client.from('user_progress').upsert({
        user_id: syncKey,
        state,
        updated_at: new Date().toISOString(),
      })
    }, 2000)
  }, [])

  const loadFromCloud = useCallback(async (syncKey: string): Promise<GameState | null> => {
    if (!isSupabaseEnabled || !supabase) return null
    const client = supabase
    const { data, error } = await client
      .from('user_progress')
      .select('state')
      .eq('user_id', syncKey)
      .single()
    if (error || !data) return null
    return data.state as GameState
  }, [])

  return { saveToCloud, loadFromCloud }
}
