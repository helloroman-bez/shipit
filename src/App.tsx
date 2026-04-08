import { useState, lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from '@/hooks/useGameState'
import { useNotifications } from '@/hooks/useNotifications'
import Layout from '@/components/Layout/Layout'
import Onboarding from '@/components/Onboarding/Onboarding'
import AchievementToast from '@/components/shared/AchievementToast'
import PenaltyToast from '@/components/shared/PenaltyToast'
import { getToday } from '@/utils/dates'
import type { TelegramUser } from '@/types'

const Dashboard = lazy(() => import('@/components/Dashboard/Dashboard'))
const LogPost = lazy(() => import('@/components/LogPost/LogPost'))
const Roulette = lazy(() => import('@/components/Roulette/Roulette'))
const Challenges = lazy(() => import('@/components/Challenges/Challenges'))
const Stats = lazy(() => import('@/components/Stats/Stats'))

type Tab = 'dashboard' | 'log' | 'roulette' | 'challenges' | 'stats'

const PAGE_ORDER: Tab[] = ['dashboard', 'log', 'roulette', 'challenges', 'stats']

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 0' }}>
      {[80, 60, 100, 60].map((h, i) => (
        <div key={i} style={{
          height: h, borderRadius: 12,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          animation: 'pulse 1s infinite',
        }} />
      ))}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const {
    state, addPost, addIdea, markIdeaUsed, deleteIdea,
    updateSettings, resetGame, completeOnboarding,
    penaltyShown, dismissPenalty,
    newlyUnlocked, dismissUnlocked,
    telegramUser, loginWithTelegram, logoutTelegram,
    syncKey, syncStatus, isCloudEnabled,
  } = useGameState()

  const today = getToday()
  const postedToday = state.lastPostDate === today

  const { requestPermission } = useNotifications(state.settings.notificationsEnabled, state.streak, postedToday)

  const tabIndex = PAGE_ORDER.indexOf(tab)

  // Handle Telegram redirect-mode auth (works on mobile)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    const hash = params.get('hash')
    if (!id || !hash) return

    const user: TelegramUser = {
      id: Number(id),
      first_name: params.get('first_name') ?? '',
      last_name: params.get('last_name') ?? undefined,
      username: params.get('username') ?? undefined,
      photo_url: params.get('photo_url') ?? undefined,
      auth_date: Number(params.get('auth_date')),
      hash,
    }
    loginWithTelegram(user)
    // Clean URL and switch to settings so user sees they're logged in
    window.history.replaceState({}, '', '/')
    setTab('stats')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (newTab: Tab) => setTab(newTab)

  const renderContent = () => {
    switch (tab) {
      case 'dashboard':
        return (
          <Dashboard
            state={state}
            onLogPost={() => setTab('log')}
            onRoulette={() => setTab('roulette')}
          />
        )
      case 'log':
        return <LogPost state={state} onAddPost={addPost} />
      case 'roulette':
        return <Roulette state={state} onGoLog={() => setTab('log')} />
      case 'challenges':
        return <Challenges state={state} />
      case 'stats':
        return (
          <Stats
            state={state}
            onReset={resetGame}
            onAddIdea={addIdea}
            onMarkIdeaUsed={markIdeaUsed}
            onDeleteIdea={deleteIdea}
            onUpdateSettings={updateSettings}
            onRequestNotifications={requestPermission}
            telegramUser={telegramUser}
            onTelegramLogin={loginWithTelegram}
            onTelegramLogout={logoutTelegram}
            syncKey={syncKey}
            syncStatus={syncStatus}
            isCloudEnabled={isCloudEnabled}
          />
        )
    }
  }

  // Show onboarding for new users
  if (!state.onboardingCompleted) {
    return (
      <AnimatePresence>
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ height: '100%' }}
        >
          <Onboarding
            onComplete={() => {
              completeOnboarding()
              setTab('log')
            }}
          />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <>
      {/* Global background grid */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.04, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        <Layout activeTab={tab} onTabChange={handleTabChange}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tabIndex > PAGE_ORDER.indexOf(tab) ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Suspense fallback={<Skeleton />}>
                {renderContent()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </Layout>
      </div>

      {/* Global toasts */}
      <AchievementToast achievementId={newlyUnlocked} onDismiss={dismissUnlocked} />
      <PenaltyToast amount={penaltyShown} onDismiss={dismissPenalty} />
    </>
  )
}
