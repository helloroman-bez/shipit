import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Tab = 'dashboard' | 'log' | 'roulette' | 'challenges' | 'stats'

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  children: ReactNode
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Главная', icon: '🏠' },
  { id: 'log', label: 'Пост', icon: '➕' },
  { id: 'roulette', label: 'Рулетка', icon: '🎰' },
  { id: 'challenges', label: 'Квесты', icon: '⚔️' },
  { id: 'stats', label: 'Стата', icon: '📊' },
]

export default function Layout({ activeTab, onTabChange, children }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg)' }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 16px' }}>
          {children}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: '8px 8px',
        display: 'flex',
        gap: 4,
        maxWidth: 480,
        margin: '0 auto',
        width: '100%',
        flexShrink: 0,
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              padding: '8px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              borderRadius: 8,
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: 0.5,
              color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-muted)',
              transition: 'color 0.2s',
            }}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                style={{
                  position: 'absolute',
                  bottom: -8,
                  left: '25%',
                  right: '25%',
                  height: 2,
                  background: 'var(--color-accent)',
                  borderRadius: 1,
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
