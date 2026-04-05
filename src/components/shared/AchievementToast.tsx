import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ACHIEVEMENTS } from '@/data/achievements'

interface Props {
  achievementId: string | null
  onDismiss: () => void
}

export default function AchievementToast({ achievementId, onDismiss }: Props) {
  const ach = achievementId ? ACHIEVEMENTS.find((a) => a.id === achievementId) : null

  useEffect(() => {
    if (!ach) return
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [ach, onDismiss])

  return (
    <AnimatePresence>
      {ach && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={onDismiss}
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid var(--color-accent)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 28px',
            zIndex: 300,
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(226,192,68,0.25)',
            cursor: 'pointer',
            minWidth: 240,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ fontSize: 36 }}>{ach.icon}</div>
          <div style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: 11, letterSpacing: 3, marginTop: 8 }}>
            ACHIEVEMENT UNLOCKED
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{ach.name}</div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>{ach.desc}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
