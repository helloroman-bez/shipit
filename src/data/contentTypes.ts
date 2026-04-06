import type { ContentType } from '@/types'

export const CONTENT_TYPES: ContentType[] = [
  { id: 'text', name: 'Текстовый пост', xp: 10, emoji: '📝' },
  { id: 'stories', name: 'Сторис-серия', xp: 15, emoji: '📱' },
  { id: 'voice', name: 'Голосовое/подкаст', xp: 20, emoji: '🎙️' },
  { id: 'video', name: 'Видео/Рилс', xp: 25, emoji: '🎬' },
  { id: 'screencast', name: 'Скринкаст/туториал', xp: 35, emoji: '🖥️' },
  { id: 'case', name: 'Кейс с цифрами', xp: 40, emoji: '📊' },
  { id: 'collab', name: 'Коллаб/эфир', xp: 50, emoji: '🤝' },
  { id: 'meme', name: 'Мем/юмор', xp: 10, emoji: '😂' },
]

export interface Platform {
  id: string
  name: string
  icon: string
  color: string
  textColor: string
}

export const PLATFORMS: Platform[] = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#833AB4', textColor: '#fff' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000', textColor: '#fff' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', color: '#2AABEE', textColor: '#fff' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#010101', textColor: '#fff' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2', textColor: '#fff' },
  { id: 'vk', name: 'VK', icon: '🔵', color: '#0077FF', textColor: '#fff' },
  { id: 'rutube', name: 'RuTube', icon: '📺', color: '#1B64EB', textColor: '#fff' },
  { id: 'dzen', name: 'Дзен', icon: '🟠', color: '#FF6900', textColor: '#fff' },
  { id: 'threads', name: 'Threads', icon: '🧵', color: '#101010', textColor: '#fff' },
  { id: 'other', name: 'Другое', icon: '➕', color: '#333', textColor: '#aaa' },
]
