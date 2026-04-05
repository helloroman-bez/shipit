import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onComplete: () => void
}

const SLIDES = [
  {
    emoji: '😤',
    title: 'Ты эксперт.',
    subtitle: 'Просто не публикуешь регулярно.',
    body: 'Нет идей, нет настроения, забыл, потом стало лень. Знакомо?',
    hint: null,
  },
  {
    emoji: '⚡',
    title: 'Ship It — это игра.',
    subtitle: 'Не трекер, не таблица. Игра.',
    body: null,
    hint: null,
    features: [
      { icon: '🔥', label: 'Стрик', desc: 'Терять 14-дневную цепочку больнее, чем написать пост' },
      { icon: '⚔️', label: 'XP и уровни', desc: 'Рост виден — это мотивирует продолжать' },
      { icon: '🎰', label: 'Smart-рулетка', desc: 'Никогда не думай «что написать»' },
      { icon: '🏆', label: 'Челленджи', desc: 'Цели на неделю и месяц держат в тонусе' },
    ],
  },
  {
    emoji: '🚀',
    title: 'Всё готово.',
    subtitle: 'Первый пост — самый важный.',
    body: 'Публикуй каждый день. Наращивай стрик. Качай уровень. Смотри как растёт аудитория.',
    hint: 'Данные хранятся локально на твоём устройстве.',
  },
]

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)

  const go = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1

  return (
    <div style={{
      minHeight: '100%',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-mono)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.04, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Progress dots */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', justifyContent: 'center', gap: 8,
        padding: '24px 0 0',
      }}>
        {SLIDES.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 8,
              height: 8, borderRadius: 4,
              background: i === step ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={() => go(i)}
          />
        ))}
      </div>

      {/* Slide content */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
      }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}
          >
            {/* Emoji */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              style={{ fontSize: 80, marginBottom: 24 }}
            >
              {slide.emoji}
            </motion.div>

            {/* Title */}
            <h1 style={{
              fontSize: 26, fontWeight: 800, marginBottom: 8,
              background: 'linear-gradient(135deg, #e2c044, #f0e68c)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}>
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: 16, color: 'var(--color-text)', marginBottom: 16, fontWeight: 600 }}>
              {slide.subtitle}
            </p>

            {/* Body text */}
            {slide.body && (
              <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                {slide.body}
              </p>
            )}

            {/* Features list (slide 2) */}
            {'features' in slide && slide.features && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, textAlign: 'left' }}>
                {slide.features.map((f, i) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 16px',
                      background: 'var(--color-surface)',
                      borderRadius: 10,
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span style={{ fontSize: 26, flexShrink: 0 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>{f.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>{f.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Hint */}
            {slide.hint && (
              <p style={{ fontSize: 11, color: 'var(--color-muted-2)', marginBottom: 8 }}>
                🔒 {slide.hint}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom buttons */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: '16px 24px 40px',
        maxWidth: 440, margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => isLast ? onComplete() : go(step + 1)}
          style={{
            width: '100%', padding: 18, borderRadius: 12, border: 'none',
            cursor: 'pointer', fontFamily: 'var(--font-mono)',
            fontSize: 15, fontWeight: 800, letterSpacing: 0.5,
            background: 'linear-gradient(135deg, #e2c044, #d4a934)',
            color: '#0a0a0f',
          }}
        >
          {isLast ? '⚡ Залогать первый пост' : 'Далее →'}
        </motion.button>

        {!isLast && (
          <button
            onClick={onComplete}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--color-muted)', padding: 8,
            }}
          >
            Пропустить
          </button>
        )}
      </div>
    </div>
  )
}
