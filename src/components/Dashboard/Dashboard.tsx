import { motion } from 'framer-motion'
import type { GameState } from '@/types'
import { getLevelForXp, getNextLevel, getLevelProgress } from '@/data/levels'
import { getDailyQuest } from '@/data/dailyQuests'
import { CONTENT_TYPES } from '@/data/contentTypes'
import { getWeekDays, getPostsForDate, getToday, getDaysLeftInSeason } from '@/utils/dates'
import { getComboLabel, getPostsToday, getStreakBonus } from '@/utils/xp'
import Card from '@/components/shared/Card'

interface Props {
  state: GameState
  onLogPost: () => void
  onRoulette: () => void
}

export default function Dashboard({ state, onLogPost, onRoulette }: Props) {
  const level = getLevelForXp(state.totalXp)
  const nextLevel = getNextLevel(state.totalXp)
  const progress = getLevelProgress(state.totalXp)
  const today = getToday()
  const postedToday = state.lastPostDate === today
  const weekDays = getWeekDays()
  const dailyQuest = getDailyQuest()
  const questDoneToday = state.dailyQuestCompletedDate === today
  const postsToday = getPostsToday(state.log)
  const comboLabel = getComboLabel(postsToday)
  const streakBonus = getStreakBonus(state.streak)
  const daysLeft = getDaysLeftInSeason(state.season.endDate)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: 'var(--color-muted)', textTransform: 'uppercase' }}>
          ship every day
        </div>
        <h1 style={{
          fontSize: 26, fontWeight: 800, margin: '6px 0 2px',
          background: 'linear-gradient(135deg, #e2c044, #f0e68c, #e2c044)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: -1,
        }}>
          SHIP IT
        </h1>
        <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>
          {level.icon} {level.name} · Сезон {state.season.number}
        </div>
      </div>

      {/* XP + Level */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 38, fontWeight: 800, color: 'var(--color-accent)', lineHeight: 1 }}>
              {state.totalXp}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 4, letterSpacing: 2 }}>
              EXPERIENCE POINTS
            </div>
            {streakBonus > 0 && (
              <div style={{ fontSize: 10, color: 'var(--color-success)', marginTop: 2 }}>
                +{Math.round(streakBonus * 100)}% streak bonus
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 44 }}>{level.icon}</div>
            <div style={{ fontSize: 10, color: '#888' }}>{level.name}</div>
          </div>
        </div>
        {nextLevel ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-muted)', marginBottom: 6 }}>
              <span>LVL {level.level} → {level.level + 1}</span>
              <span>{nextLevel.minXp - state.totalXp} XP до «{nextLevel.name}»</span>
            </div>
            <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3 }}>
              <motion.div
                style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #e2c044, #f0e68c)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--color-accent)', textAlign: 'center', paddingTop: 8 }}>
            👑 Максимальный уровень достигнут!
          </div>
        )}
      </Card>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'STREAK', value: state.streak, suffix: 'д.', color: state.streak >= 7 ? 'var(--color-accent)' : 'var(--color-text)' },
          { label: 'ЛУЧШИЙ', value: state.bestStreak, suffix: 'д.', color: '#888' },
          { label: 'ПОСТОВ', value: state.totalPosts, suffix: '', color: 'var(--color-text)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--color-surface)', borderRadius: 10, padding: '14px 12px',
            border: '1px solid var(--color-border)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>
              {s.value}<span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{s.suffix}</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--color-muted)', letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Combo indicator */}
      {comboLabel && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: 'linear-gradient(135deg, #1a1500, #2a2200)',
            border: '1px solid var(--color-accent)',
            borderRadius: 10, padding: '10px 16px', textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-accent)' }}>
            ⚡ {comboLabel}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-muted)', marginLeft: 8 }}>
            {postsToday} поста за сегодня
          </span>
        </motion.div>
      )}

      {/* Daily Quest */}
      <Card accent={!questDoneToday}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 2, marginBottom: 6 }}>
              DAILY QUEST
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>
              {dailyQuest.text}
            </div>
          </div>
          <div style={{
            background: questDoneToday ? 'var(--color-success)' : 'var(--color-accent)',
            color: '#0a0a0f',
            borderRadius: 8, padding: '4px 10px',
            fontSize: 11, fontWeight: 800,
            marginLeft: 12, whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {questDoneToday ? '✓ DONE' : '+15 XP'}
          </div>
        </div>
      </Card>

      {/* Week view */}
      <Card style={{ padding: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 2, marginBottom: 10 }}>НЕДЕЛЯ</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {weekDays.map((d, i) => {
            const posts = getPostsForDate(state.log, d.date).length
            const isToday = d.date === today
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: isToday ? 'var(--color-accent)' : 'var(--color-muted)', marginBottom: 5 }}>
                  {d.dayLabel}
                </div>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: posts > 0 ? 'linear-gradient(135deg, #e2c044, #d4a934)' : 'var(--color-border)',
                  border: isToday ? '2px solid var(--color-accent)' : '1px solid transparent',
                  color: posts > 0 ? '#0a0a0f' : '#333',
                  fontSize: posts > 1 ? 11 : 14, fontWeight: 700,
                }}>
                  {posts > 1 ? `×${posts}` : posts > 0 ? '✓' : '·'}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button onClick={onLogPost} style={{
          padding: '16px 12px',
          background: 'linear-gradient(135deg, #e2c044, #d4a934)',
          color: '#0a0a0f', border: 'none', borderRadius: 12,
          cursor: 'pointer', fontFamily: 'var(--font-mono)',
          fontWeight: 700, fontSize: 13,
        }}>
          ⚡ Залогать пост
        </button>
        <button onClick={onRoulette} style={{
          padding: '16px 12px',
          background: 'var(--color-surface)', color: 'var(--color-accent)',
          border: '1px solid var(--color-accent)', borderRadius: 12,
          cursor: 'pointer', fontFamily: 'var(--font-mono)',
          fontWeight: 700, fontSize: 13,
        }}>
          🎰 Рулетка
        </button>
      </div>

      {/* Today status */}
      <div style={{
        padding: '12px 16px', borderRadius: 10,
        background: postedToday ? '#0d1f0d' : '#1f0d0d',
        border: `1px solid ${postedToday ? '#1a3a1a' : '#3a1a1a'}`,
        textAlign: 'center', fontSize: 12,
        color: postedToday ? 'var(--color-success)' : 'var(--color-danger)',
      }}>
        {postedToday ? '✅ Сегодня пост есть — цепочка жива!' : '⚠️ Сегодня нет поста — не сломай стрик!'}
      </div>

      {/* Season progress */}
      <Card style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 2, marginBottom: 4 }}>
              СЕЗОН {state.season.number}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-accent)' }}>
              {state.seasonXp} <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>XP</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{daysLeft}</div>
            <div style={{ fontSize: 9, color: 'var(--color-muted)', letterSpacing: 1 }}>ДНЕЙ ОСТАЛОСЬ</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
