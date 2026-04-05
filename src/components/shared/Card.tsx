import type { ReactNode, CSSProperties } from 'react'

interface Props {
  children: ReactNode
  style?: CSSProperties
  accent?: boolean
  onClick?: () => void
}

export default function Card({ children, style, accent, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: 20,
        border: `1px solid ${accent ? 'var(--color-accent)' : 'var(--color-border)'}`,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
