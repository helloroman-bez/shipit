import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  amount: number
  onDismiss: () => void
}

export default function PenaltyToast({ amount, onDismiss }: Props) {
  useEffect(() => {
    if (!amount) return
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [amount, onDismiss])

  return (
    <AnimatePresence>
      {amount > 0 && (
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
            background: '#1f0d0d',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 28px',
            zIndex: 300,
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(248,113,113,0.2)',
            cursor: 'pointer',
            minWidth: 240,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ fontSize: 32 }}>💔</div>
          <div style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: 11, letterSpacing: 3, marginTop: 8 }}>
            СТРИК СЛОМАН
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-danger)', marginTop: 4 }}>
            -{amount} XP
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>
            Пропустил день — потерял 10% XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
