import type { ReactNode } from 'react'

interface PageHeaderProps {
  icon: ReactNode
  title: string
  actions?: ReactNode
}

export function PageHeader({ icon, title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <span className="text-text-secondary">{icon}</span>
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      </div>
      {actions}
    </div>
  )
}
