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

export const PLATFORMS = ['Instagram', 'Reels', 'YouTube Shorts', 'Telegram', 'Другое']
