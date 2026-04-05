import { motion } from 'framer-motion'
import type { GameState } from '@/types'
import { CHALLENGES } from '@/data/challenges'
import Card from '@/components/shared/Card'

interface Props {
  state: GameState
}

export default function Challenges({ state }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center', paddingBottom: 4 }}>
        <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 4 }}>ЧЕЛЛЕНДЖИ</div>
      </div>

      {CHALLENGES.map((ch, i) => {
        const isCompleted = state.completedChallenges.includes(ch.id)
        const progress = ch.progressValue(state)
        const pct = Math.min((progress / ch.progressMax) * 100, 100)

        return (
          <motion.div
            key={ch.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card accent={isCompleted} style={{ opacity: isCompleted ? 0.7 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>{ch.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                        {ch.name}
                        {isCompleted && <span style={{ color: 'var(--color-success)', marginLeft: 6 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 10 }}>
                        {ch.desc}
                      </div>
                    </div>
                    <div style={{
                      background: 'var(--color-accent)', color: '#0a0a0f',
                      borderRadius: 6, padding: '3px 8px',
                      fontSize: 11, fontWeight: 800, flexShrink: 0, marginLeft: 8,
                    }}>
                      +{ch.bonusXp} XP
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3 }}>
                    <motion.div
                      style={{
                        height: '100%', borderRadius: 3,
                        background: isCompleted
                          ? 'var(--color-success)'
                          : 'linear-gradient(90deg, #e2c044, #f0e68c)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 + 0.1 }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 4 }}>
                    {progress} / {ch.progressMax}
                    {ch.durationDays && !isCompleted && (
                      <span style={{ marginLeft: 8 }}>
                        · {ch.durationDays}-дневный цикл
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}

      {state.completedChallenges.length > 0 && (
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: '#0d1f0d', border: '1px solid #1a3a1a',
          fontSize: 12, color: 'var(--color-success)', textAlign: 'center',
        }}>
          🏆 Завершено челленджей: {state.completedChallenges.length}
        </div>
      )}
    </div>
  )
}
