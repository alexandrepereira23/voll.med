import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white border border-border rounded-lg p-8 flex flex-col items-center text-center gap-3">
      <div className="w-10 h-10 rounded-md bg-surface flex items-center justify-center text-text-secondary">
        <Inbox size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
