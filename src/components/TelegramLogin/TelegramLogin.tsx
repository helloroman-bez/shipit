import { useEffect, useRef } from 'react'
import { TELEGRAM_BOT_USERNAME } from '@/hooks/useTelegramAuth'

export default function TelegramLoginButton() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!TELEGRAM_BOT_USERNAME || !containerRef.current) return

    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME)
    script.setAttribute('data-size', 'large')
    // Redirect mode — works on mobile and desktop
    script.setAttribute('data-auth-url', window.location.origin)
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-radius', '10')
    script.async = true

    containerRef.current.appendChild(script)
  }, [])

  return <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center' }} />
}
