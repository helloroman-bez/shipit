import { useEffect, useRef } from 'react'
import type { TelegramUser } from '@/types'
import { TELEGRAM_BOT_USERNAME } from '@/hooks/useTelegramAuth'

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void
  }
}

interface Props {
  onAuth: (user: TelegramUser) => void
}

export default function TelegramLoginButton({ onAuth }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!TELEGRAM_BOT_USERNAME || !containerRef.current) return

    window.onTelegramAuth = onAuth

    // Clear any previous widget
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-radius', '10')
    script.async = true

    containerRef.current.appendChild(script)

    return () => {
      delete (window as Partial<Window>).onTelegramAuth
    }
  }, [onAuth])

  return <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center' }} />
}
