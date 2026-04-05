import type { DailyQuest } from '@/types'

export const DAILY_QUESTS: DailyQuest[] = [
  { id: 'q1', text: 'Опубликуй пост с реальными цифрами', contentTypeId: 'case' },
  { id: 'q2', text: 'Сними 30-секундный Reels', contentTypeId: 'video' },
  { id: 'q3', text: 'Напиши пост-провокацию со спорным мнением' },
  { id: 'q4', text: 'Покажи закулисье своей работы' },
  { id: 'q5', text: 'Запиши голосовое или подкаст', contentTypeId: 'voice' },
  { id: 'q6', text: 'Опубликуй кейс клиента от его лица' },
  { id: 'q7', text: 'Сделай сторис-серию из 5+ слайдов', contentTypeId: 'stories' },
  { id: 'q8', text: 'Запусти опрос или голосование в сторис' },
  { id: 'q9', text: 'Разбери ошибку — что не сработало и почему' },
  { id: 'q10', text: 'Сделай скринкаст с разбором инструмента', contentTypeId: 'screencast' },
  { id: 'q11', text: 'Напиши пост с неочевидным фактом о нише' },
  { id: 'q12', text: 'Сравни до/после — результат клиента или своей работы' },
  { id: 'q13', text: 'Опубликуй пост-список: топ инструментов или ошибок' },
  { id: 'q14', text: 'Мем про боль целевой аудитории', contentTypeId: 'meme' },
  { id: 'q15', text: 'Расскажи сторителлинг — как ты пришёл к продукту' },
  { id: 'q16', text: 'Покажи интерфейс продукта за 60 секунд', contentTypeId: 'video' },
  { id: 'q17', text: 'Запости в формате карусель: 5 шагов к результату' },
  { id: 'q18', text: 'Ответь на частый вопрос клиента в видео', contentTypeId: 'video' },
  { id: 'q19', text: 'Поделись 3 инсайтами за неделю', contentTypeId: 'voice' },
  { id: 'q20', text: 'Опубликуй пост с хуком «Я был неправ, когда думал...»' },
  { id: 'q21', text: 'Покажи твой рабочий процесс изнутри' },
]

export function getDailyQuest(): DailyQuest {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return DAILY_QUESTS[dayOfYear % DAILY_QUESTS.length]
}
