import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoulette } from '@/hooks/useRoulette'
import type { GameState } from '@/types'
import Card from '@/components/shared/Card'

interface Props {
  state: GameState
  onGoLog: () => void
}

export default function Roulette({ state, onGoLog }: Props) {
  const { result, displayTask, isSpinning, spin } = useRoulette(state.settings.soundEnabled)
  const [expanded, setExpanded] = useState(false)

  const task = isSpinning ? displayTask : result

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: 4 }}>SMART РУЛЕТКА</div>
      </div>

      {/* Slot display */}
      <Card style={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {task ? (
            <motion.div
              key={task.id + (isSpinning ? '-spin' : '-final')}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.08 }}
              style={{ textAlign: 'center', width: '100%' }}
            >
              <div style={{
                fontSize: 17, fontWeight: 700, lineHeight: 1.4,
                color: isSpinning ? 'var(--color-muted)' : 'var(--color-accent)',
                marginBottom: isSpinning ? 0 : 16,
              }}>
                {task.topic}
              </div>
              {!isSpinning && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {[task.format, task.platform].map((tag, i) => (
                      <span key={i} style={{
                        padding: '4px 10px', borderRadius: 6,
                        background: 'var(--color-border)',
                        fontSize: 11, color: '#888',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--color-muted)',
                    fontStyle: 'italic', marginBottom: 8,
                  }}>
                    Хук: «{task.hook}»
                  </div>
                  <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-accent)', fontSize: 11, fontFamily: 'var(--font-mono)',
                      textDecoration: 'underline',
                    }}
                  >
                    {expanded ? 'Скрыть скелет ↑' : 'Показать структуру поста ↓'}
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          marginTop: 12, padding: '12px 14px',
                          background: 'var(--color-border)', borderRadius: 8,
                          fontSize: 12, lineHeight: 1.6, color: '#aaa',
                          textAlign: 'left',
                        }}>
                          {task.skeleton}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ fontSize: 56, color: '#222' }}
            >
              🎰
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={isSpinning}
        style={{
          width: '100%', padding: 18, borderRadius: 12, border: 'none',
          cursor: isSpinning ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 800,
          background: isSpinning ? 'var(--color-border)' : 'linear-gradient(135deg, #e2c044, #d4a934)',
          color: isSpinning ? '#555' : '#0a0a0f',
          letterSpacing: 1,
          animation: isSpinning ? 'pulse 0.6s infinite' : 'none',
        }}
      >
        {isSpinning ? 'КРУТИТСЯ...' : '🎲 КРУТИТЬ РУЛЕТКУ'}
      </button>

      {/* Go log */}
      {result && !isSpinning && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: '#0d1f0d', border: '1px solid #1a3a1a',
            fontSize: 12, color: 'var(--color-success)',
            textAlign: 'center', marginBottom: 8,
          }}>
            Сделай этот контент, залогай пост и получи XP!
          </div>
          <button
            onClick={onGoLog}
            style={{
              width: '100%', padding: 14, borderRadius: 12,
              background: 'var(--color-surface)', border: '1px solid var(--color-accent)',
              color: 'var(--color-accent)', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13,
            }}
          >
            ⚡ Залогать этот пост
          </button>
        </motion.div>
      )}
    </div>
  )
}
