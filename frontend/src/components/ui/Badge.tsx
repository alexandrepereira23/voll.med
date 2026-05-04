import type { ReactNode } from 'react'

type Variant = 'success' | 'danger' | 'warning' | 'neutral'

interface BadgeProps {
  variant?: Variant
  children: ReactNode
}

const variants: Record<Variant, string> = {
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  neutral: 'bg-surface text-text-secondary',
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
