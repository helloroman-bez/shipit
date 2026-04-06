import { useState } from 'react'
import { motion } from 'framer-motion'
import type { GameState } from '@/types'
import { CONTENT_TYPES, PLATFORMS, type Platform } from '@/data/contentTypes'
import { getDailyQuest } from '@/data/dailyQuests'
import { getToday } from '@/utils/dates'
import { calculateXp, getPostsToday, getComboLabel } from '@/utils/xp'
import { playSuccess } from '@/utils/sounds'
import Card from '@/components/shared/Card'

interface Props {
  state: GameState
  onAddPost: (
    contentTypeId: string,
    platform?: string,
    reach?: number,
    fromRoulette?: boolean,
    dailyQuestCompleted?: boolean
  ) => void
}

export default function LogPost({ state, onAddPost }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [reach, setReach] = useState('')
  const [markQuest, setMarkQuest] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const today = getToday()
  const questDoneToday = state.dailyQuestCompletedDate === today
  const dailyQuest = getDailyQuest()
  const postsToday = getPostsToday(state.log)
  const comboLabel = getComboLabel(postsToday + 1)

  const xpPreview = selectedType
    ? calculateXp(
        CONTENT_TYPES.find((c) => c.id === selectedType)!.xp,
        state.streak,
        postsToday + 1,
        markQuest && !questDoneToday
      )
    : null

  const selectedPlatformName = selectedPlatform
    ? PLATFORMS.find((p) => p.id === selectedPlatform)?.name
    : undefined

  const handleSubmit = () => {
    if (!selectedType) return
    onAddPost(
      selectedType,
      selectedPlatformName,
      reach ? parseInt(reach) : undefined,
      false,
      markQuest && !questDoneToday,
    )
    if (state.settings.vibrateEnabled) navigator.vibrate?.([50, 30, 50])
    if (state.settings.soundEnabled) playSuccess()
    setSubmitted(true)
    setTimeout(() => {
      setSelectedType(null)
      setSelectedPlatform(null)
      setReach('')
      setMarkQuest(false)
      setSubmitted(false)
    }, 1200)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ textAlign: 'center', padding: '80px 20px' }}
      >
        <div style={{ fontSize: 72, animation: 'pop 0.5s ease-out' }}>⚡</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-accent)', marginTop: 16 }}>
          +{xpPreview?.total || 0} XP!
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 8 }}>Пост залогирован!</div>
      </motion.div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center', paddingBottom: 4 }}>
        <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 4 }}>НОВЫЙ ПОСТ</div>
      </div>

      {/* Content type grid */}
      <div>
        <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 2, marginBottom: 10 }}>
          ТИП КОНТЕНТА
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {CONTENT_TYPES.map((ct) => (
            <button
              key={ct.id}
              onClick={() => setSelectedType(ct.id)}
              style={{
                padding: '14px 12px', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'var(--font-mono)', textAlign: 'left',
                background: selectedType === ct.id ? '#1a1a2e' : 'var(--color-surface)',
                border: `1px solid ${selectedType === ct.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                color: selectedType === ct.id ? 'var(--color-accent)' : '#888',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 22 }}>{ct.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{ct.name}</div>
              <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>+{ct.xp} XP</div>
            </button>
          ))}
        </div>
      </div>

      {/* Platform */}
      <div>
        <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 2, marginBottom: 10 }}>
          ПЛОЩАДКА
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {PLATFORMS.map((p: Platform) => {
            const isSelected = selectedPlatform === p.id
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(isSelected ? null : p.id)}
                style={{
                  padding: '10px 8px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  border: `2px solid ${isSelected ? p.color : 'var(--color-border)'}`,
                  background: isSelected ? p.color + '22' : 'var(--color-surface)',
                  color: isSelected ? p.textColor === '#fff' ? '#e8e6e1' : p.textColor : '#666',
                  transition: 'all 0.15s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: p.color,
                    opacity: 0.15,
                    pointerEvents: 'none',
                  }} />
                )}
                <span style={{ fontSize: 16, flexShrink: 0 }}>{p.icon}</span>
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: isSelected ? '#e8e6e1' : '#888',
                }}>
                  {p.name}
                </span>
                {isSelected && (
                  <span style={{
                    position: 'absolute', top: 4, right: 5,
                    fontSize: 9, color: p.color, fontWeight: 800,
                  }}>✓</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Reach (optional) */}
      <div>
        <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 2, marginBottom: 10 }}>
          ОХВАТЫ (необязательно)
        </div>
        <input
          type="number"
          placeholder="Сколько просмотров / охватов?"
          value={reach}
          onChange={(e) => setReach(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 10, color: 'var(--color-text)', fontSize: 13,
            fontFamily: 'var(--font-mono)', outline: 'none',
          }}
        />
      </div>

      {/* Daily quest checkbox */}
      {!questDoneToday && (
        <button
          onClick={() => setMarkQuest(!markQuest)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
            background: markQuest ? '#0d1f0d' : 'var(--color-surface)',
            border: `1px solid ${markQuest ? 'var(--color-success)' : 'var(--color-border)'}`,
            fontFamily: 'var(--font-mono)', textAlign: 'left',
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: 4,
            border: `2px solid ${markQuest ? 'var(--color-success)' : 'var(--color-border)'}`,
            background: markQuest ? 'var(--color-success)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {markQuest && <span style={{ color: '#0a0a0f', fontSize: 12, fontWeight: 800 }}>✓</span>}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: markQuest ? 'var(--color-success)' : '#888' }}>
              Выполнен daily quest +15 XP
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>{dailyQuest.text}</div>
          </div>
        </button>
      )}

      {/* XP Preview */}
      {xpPreview && (
        <Card style={{ textAlign: 'center', padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Будет начислено</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-accent)', marginTop: 4 }}>
            +{xpPreview.total} XP
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
            {xpPreview.streakBonus > 0 && (
              <span style={{ fontSize: 10, color: 'var(--color-success)' }}>+{xpPreview.streakBonus} стрик</span>
            )}
            {xpPreview.comboBonus > 0 && (
              <span style={{ fontSize: 10, color: 'var(--color-accent)' }}>
                {comboLabel} +{xpPreview.comboBonus}
              </span>
            )}
            {xpPreview.questBonus > 0 && (
              <span style={{ fontSize: 10, color: 'var(--color-success)' }}>+{xpPreview.questBonus} квест</span>
            )}
          </div>
        </Card>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!selectedType}
        style={{
          width: '100%', padding: 18, borderRadius: 12, border: 'none',
          cursor: selectedType ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 800,
          background: selectedType ? 'linear-gradient(135deg, #e2c044, #d4a934)' : 'var(--color-border)',
          color: selectedType ? '#0a0a0f' : '#333',
          transition: 'all 0.2s', letterSpacing: 1,
        }}
      >
        {selectedType ? '⚡ ЗАЛОГАТЬ' : 'Выбери тип контента'}
      </button>
    </div>
  )
}
