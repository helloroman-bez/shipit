import { useState } from 'react'
import type React from 'react'
import { motion } from 'framer-motion'
import type { GameState, Settings, TelegramUser } from '@/types'
import TelegramLoginButton from '@/components/TelegramLogin/TelegramLogin'
import { isTelegramLoginEnabled } from '@/hooks/useTelegramAuth'
import { ACHIEVEMENTS, getAchievementProgress } from '@/data/achievements'
import { CONTENT_TYPES } from '@/data/contentTypes'
import { LEVELS, getLevelForXp } from '@/data/levels'
import { getLast90Days, formatDate } from '@/utils/dates'
import { generateShareCard } from '@/utils/shareCard'
import Card from '@/components/shared/Card'

interface Props {
  state: GameState
  onReset: () => void
  onAddIdea: (text: string) => void
  onMarkIdeaUsed: (id: string) => void
  onDeleteIdea: (id: string) => void
  onUpdateSettings: (s: Partial<Settings>) => void
  onRequestNotifications: () => Promise<boolean>
  telegramUser: TelegramUser | null
  onTelegramLogin: (user: TelegramUser) => void
  onTelegramLogout: () => void
  syncKey: string
  syncStatus: 'idle' | 'syncing' | 'ok' | 'error'
  isCloudEnabled: boolean
}

export default function Stats({
  state, onReset,
  onAddIdea, onMarkIdeaUsed, onDeleteIdea,
  onUpdateSettings, onRequestNotifications,
  telegramUser, onTelegramLogin, onTelegramLogout,
  syncKey, syncStatus, isCloudEnabled,
}: Props) {
  const [tab, setTab] = useState<'achievements' | 'heatmap' | 'levels' | 'ideas' | 'settings'>('achievements')
  const [newIdea, setNewIdea] = useState('')
  const level = getLevelForXp(state.totalXp)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center', paddingBottom: 4 }}>
        <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 4 }}>СТАТИСТИКА</div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'ВСЕГО XP', value: state.totalXp },
          { label: 'ПОСТОВ', value: state.totalPosts },
          { label: 'СТРИК', value: `${state.streak}д.` },
          { label: 'ЛУЧШИЙ', value: `${state.bestStreak}д.` },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--color-surface)', borderRadius: 10, padding: '14px 16px',
            border: '1px solid var(--color-border)',
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-accent)' }}>{s.value}</div>
            <div style={{ fontSize: 9, color: 'var(--color-muted)', letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Share button */}
      <button
        onClick={() => generateShareCard(state)}
        style={{
          padding: 14, borderRadius: 12,
          background: 'var(--color-surface)', border: '1px solid var(--color-accent)',
          color: 'var(--color-accent)', cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13,
        }}
      >
        📤 Поделиться статистикой
      </button>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--color-surface)', borderRadius: 10, padding: 4 }}>
        {[
          { id: 'achievements', label: 'Ачивки' },
          { id: 'heatmap', label: 'Карта' },
          { id: 'levels', label: 'Уровни' },
          { id: 'ideas', label: 'Идеи' },
          { id: 'settings', label: '⚙️' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            style={{
              flex: 1, padding: '8px 0', fontSize: 11, fontWeight: 600,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              background: tab === t.id ? 'var(--color-accent)' : 'transparent',
              color: tab === t.id ? '#0a0a0f' : 'var(--color-muted)',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Achievements */}
      {tab === 'achievements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ACHIEVEMENTS.map((ach, i) => {
            const unlocked = state.unlockedAchievements.some((u) => u.id === ach.id)
            const prog = getAchievementProgress(ach, state)
            const pct = prog ? (prog.current / prog.max) * 100 : 0

            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: 'var(--color-surface)', borderRadius: 10,
                  border: `1px solid ${unlocked ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  opacity: unlocked ? 1 : 0.55,
                }}
              >
                <span style={{ fontSize: 28 }}>{ach.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: unlocked ? 'var(--color-accent)' : '#888' }}>
                    {ach.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>{ach.desc}</div>
                  {prog && !unlocked && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2 }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          background: 'var(--color-accent)',
                          width: `${pct}%`, transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--color-muted)', marginTop: 3 }}>
                        {prog.current} / {prog.max}
                      </div>
                    </div>
                  )}
                </div>
                {unlocked && <span style={{ color: 'var(--color-success)', fontSize: 18 }}>✓</span>}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Heatmap */}
      {tab === 'heatmap' && (
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 2, marginBottom: 12 }}>
            АКТИВНОСТЬ ЗА 90 ДНЕЙ
          </div>
          <HeatMap log={state.log} />
          {/* Content type breakdown */}
          <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 2, margin: '16px 0 10px' }}>
            ПО ТИПАМ
          </div>
          {CONTENT_TYPES.filter((ct) => (state.typeCount[ct.id] || 0) > 0).map((ct) => (
            <div key={ct.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', background: 'var(--color-surface)', borderRadius: 8,
              marginBottom: 4, border: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: 16 }}>{ct.emoji}</span>
              <span style={{ flex: 1, fontSize: 12, color: '#888' }}>{ct.name}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent)' }}>
                {state.typeCount[ct.id]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Levels */}
      {tab === 'levels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {LEVELS.map((l) => {
            const current = l.name === level.name
            const reached = state.totalXp >= l.minXp
            return (
              <div key={l.level} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px',
                background: current ? '#1a1a2e' : 'var(--color-surface)',
                borderRadius: 8,
                border: `1px solid ${current ? 'var(--color-accent)' : 'var(--color-border)'}`,
                opacity: reached ? 1 : 0.35,
              }}>
                <span style={{ fontSize: 22 }}>{l.icon}</span>
                <span style={{
                  flex: 1, fontSize: 13,
                  fontWeight: current ? 700 : 400,
                  color: current ? 'var(--color-accent)' : '#888',
                }}>
                  {l.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{l.minXp} XP</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Ideas bank */}
      {tab === 'ideas' && (
        <IdeaBank
          state={state}
          newIdea={newIdea}
          setNewIdea={setNewIdea}
          onAddIdea={onAddIdea}
          onMarkIdeaUsed={onMarkIdeaUsed}
          onDeleteIdea={onDeleteIdea}
        />
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <SettingsPanel
          state={state}
          onUpdateSettings={onUpdateSettings}
          onRequestNotifications={onRequestNotifications}
          telegramUser={telegramUser}
          onTelegramLogin={onTelegramLogin}
          onTelegramLogout={onTelegramLogout}
          syncKey={syncKey}
          syncStatus={syncStatus}
          isCloudEnabled={isCloudEnabled}
        />
      )}

      {/* Reset */}
      <button
        onClick={() => {
          if (confirm('Точно сбросить весь прогресс? Это необратимо.')) onReset()
        }}
        style={{
          padding: 12, background: 'transparent',
          border: '1px solid #2a1a1a', borderRadius: 10, cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: 11, color: '#553333',
          letterSpacing: 1, marginTop: 8,
        }}
      >
        СБРОСИТЬ ПРОГРЕСС
      </button>
    </div>
  )
}

function HeatMap({ log }: { log: GameState['log'] }) {
  const days = getLast90Days()
  const countByDay: Record<string, number> = {}
  for (const entry of log) {
    countByDay[entry.date] = (countByDay[entry.date] || 0) + 1
  }

  const getColor = (count: number) => {
    if (count === 0) return 'var(--color-border)'
    if (count === 1) return '#5a4a00'
    if (count === 2) return '#8a7000'
    if (count >= 3) return 'var(--color-accent)'
    return 'var(--color-border)'
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {days.map((date) => {
        const count = countByDay[date] || 0
        return (
          <div
            key={date}
            title={`${formatDate(date)}: ${count} пост${count === 1 ? '' : 'а'}`}
            style={{
              width: 10, height: 10, borderRadius: 2,
              background: getColor(count),
              flexShrink: 0,
            }}
          />
        )
      })}
    </div>
  )
}

function IdeaBank({ state, newIdea, setNewIdea, onAddIdea, onMarkIdeaUsed, onDeleteIdea }: {
  state: GameState
  newIdea: string
  setNewIdea: (v: string) => void
  onAddIdea: (text: string) => void
  onMarkIdeaUsed: (id: string) => void
  onDeleteIdea: (id: string) => void
}) {
  const handleAdd = () => {
    const trimmed = newIdea.trim()
    if (!trimmed) return
    onAddIdea(trimmed)
    setNewIdea('')
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Добавить идею для поста..."
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          style={{
            flex: 1, padding: '10px 12px',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 8, color: 'var(--color-text)', fontSize: 12,
            fontFamily: 'var(--font-mono)', outline: 'none',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!newIdea.trim()}
          style={{
            padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: newIdea.trim() ? 'var(--color-accent)' : 'var(--color-border)',
            color: newIdea.trim() ? '#0a0a0f' : '#555',
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13,
            flexShrink: 0,
          }}
        >
          +
        </button>
      </div>
      {state.ideas.length === 0 && (
        <div style={{ color: 'var(--color-muted)', fontSize: 12, textAlign: 'center', padding: 20 }}>
          Банк идей пуст — добавь первую идею!
        </div>
      )}
      {state.ideas.map((idea) => (
        <div key={idea.id} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', background: 'var(--color-surface)', borderRadius: 8,
          marginBottom: 4, border: '1px solid var(--color-border)',
          opacity: idea.used ? 0.45 : 1,
        }}>
          <span style={{
            flex: 1, fontSize: 12,
            color: idea.used ? 'var(--color-muted)' : 'var(--color-text)',
            textDecoration: idea.used ? 'line-through' : 'none',
          }}>
            {idea.text}
          </span>
          {!idea.used && (
            <button
              onClick={() => onMarkIdeaUsed(idea.id)}
              title="Отметить использованной"
              style={{
                background: 'none', border: '1px solid var(--color-border)',
                borderRadius: 6, cursor: 'pointer', padding: '3px 8px',
                color: 'var(--color-success)', fontSize: 11, fontFamily: 'var(--font-mono)',
              }}
            >
              ✓
            </button>
          )}
          <button
            onClick={() => onDeleteIdea(idea.id)}
            title="Удалить"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-muted)', fontSize: 14, padding: '3px 6px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

function SettingsPanel({ state, onUpdateSettings, onRequestNotifications, telegramUser, onTelegramLogin, onTelegramLogout, syncKey, syncStatus, isCloudEnabled }: {
  state: GameState
  onUpdateSettings: (s: Partial<Settings>) => void
  onRequestNotifications: () => Promise<boolean>
  telegramUser: TelegramUser | null
  onTelegramLogin: (user: TelegramUser) => void
  onTelegramLogout: () => void
  syncKey: string
  syncStatus: 'idle' | 'syncing' | 'ok' | 'error'
  isCloudEnabled: boolean
}) {
  const notifSupported = 'Notification' in window
  const notifPermission = notifSupported ? Notification.permission : 'denied'

  const handleNotifToggle = async () => {
    if (state.settings.notificationsEnabled) {
      onUpdateSettings({ notificationsEnabled: false })
      return
    }
    if (notifPermission !== 'granted') {
      const granted = await onRequestNotifications()
      if (!granted) return
    }
    onUpdateSettings({ notificationsEnabled: true })
  }

  const syncLabel = { idle: '', syncing: '⟳ Сохранение...', ok: '✓ Сохранено', error: '✗ Ошибка' }[syncStatus]

  const rows: { label: string; desc: string; key: keyof typeof state.settings }[] = [
    { label: '🔊 Звуки', desc: 'Эффекты при логировании, анлоке достижений, рулетке', key: 'soundEnabled' },
    { label: '📳 Вибрация', desc: 'Тактильный отклик при логировании и анлоке', key: 'vibrateEnabled' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Telegram auth / cloud sync */}
      <div style={{
        padding: '16px', background: 'var(--color-surface)', borderRadius: 10,
        border: `1px solid ${telegramUser ? 'var(--color-success)' : 'var(--color-border)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>☁️ Синхронизация</div>
          {isCloudEnabled && syncStatus !== 'idle' && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: syncStatus === 'ok' ? 'var(--color-success)' : syncStatus === 'error' ? 'var(--color-danger)' : 'var(--color-muted)',
            }}>
              {syncLabel}
            </span>
          )}
        </div>

        {telegramUser ? (
          /* Logged in */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              {telegramUser.photo_url && (
                <img
                  src={telegramUser.photo_url}
                  alt=""
                  style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }}
                />
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                  {telegramUser.first_name}{telegramUser.last_name ? ` ${telegramUser.last_name}` : ''}
                </div>
                {telegramUser.username && (
                  <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>
                    @{telegramUser.username}
                  </div>
                )}
              </div>
              <div style={{
                marginLeft: 'auto', fontSize: 10, color: 'var(--color-success)',
                fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                ✓ Подключён
              </div>
            </div>
            {!isCloudEnabled && (
              <div style={{ fontSize: 10, color: 'var(--color-muted)', marginBottom: 10, lineHeight: 1.5 }}>
                Telegram подключён, но Supabase не настроен — синхронизация неактивна.
              </div>
            )}
            <button
              onClick={() => { if (confirm('Выйти из Telegram аккаунта?')) onTelegramLogout() }}
              style={{
                width: '100%', padding: '8px', borderRadius: 8,
                background: 'transparent', border: '1px solid var(--color-border)',
                color: 'var(--color-muted)', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 11,
              }}
            >
              Выйти
            </button>
          </div>
        ) : isTelegramLoginEnabled ? (
          /* Not logged in, Telegram configured */
          <div>
            <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 12, lineHeight: 1.5 }}>
              Войди через Telegram — прогресс автоматически синхронизируется на всех устройствах.
            </div>
            <TelegramLoginButton />
            {isCloudEnabled && (
              <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 10, textAlign: 'center' }}>
                Sync ID: <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.6 }}>{syncKey.slice(0, 16)}…</span>
              </div>
            )}
          </div>
        ) : (
          /* Telegram not configured */
          <div style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.6 }}>
            Для входа через Telegram добавь переменную<br />
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>VITE_TELEGRAM_BOT_USERNAME</span><br />
            в настройках Vercel и создай бота через @BotFather.
            {!isCloudEnabled && (
              <><br /><br />
              Также нужны <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>VITE_SUPABASE_URL</span> и <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>VITE_SUPABASE_ANON_KEY</span>.</>
            )}
          </div>
        )}
      </div>

      {rows.map(({ label, desc, key }) => (
        <div key={key} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '14px 16px', background: 'var(--color-surface)', borderRadius: 10,
          border: '1px solid var(--color-border)',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 3 }}>{desc}</div>
          </div>
          <Toggle
            value={state.settings[key] as boolean}
            onChange={(v) => onUpdateSettings({ [key]: v })}
          />
        </div>
      ))}

      {/* Notifications */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '14px 16px', background: 'var(--color-surface)', borderRadius: 10,
        border: '1px solid var(--color-border)',
        opacity: notifSupported ? 1 : 0.5,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>🔔 Уведомления</div>
          <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 3 }}>
            Напоминание в 21:00 если нет поста
          </div>
          {!notifSupported && (
            <div style={{ fontSize: 10, color: 'var(--color-danger)', marginTop: 3 }}>
              Не поддерживается в этом браузере
            </div>
          )}
          {notifSupported && notifPermission === 'denied' && (
            <div style={{ fontSize: 10, color: 'var(--color-danger)', marginTop: 3 }}>
              Доступ запрещён в настройках браузера
            </div>
          )}
        </div>
        <Toggle
          value={state.settings.notificationsEnabled}
          onChange={() => handleNotifToggle()}
          disabled={!notifSupported || notifPermission === 'denied'}
        />
      </div>
    </div>
  )
}

function Toggle({ value, onChange, disabled }: {
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: value ? 'var(--color-accent)' : 'var(--color-border)',
        position: 'relative', flexShrink: 0,
        transition: 'background 0.2s',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: value ? '#0a0a0f' : '#555',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}
