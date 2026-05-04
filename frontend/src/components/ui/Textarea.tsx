import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <textarea
        ref={ref}
        {...props}
        className={`
          w-full px-3 py-2.5 rounded-md bg-white border text-text-primary text-sm
          placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30
          focus:border-accent transition-colors duration-150 resize-y min-h-24
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-danger' : 'border-border'} ${className}
        `}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
)

Textarea.displayName = 'Textarea'
