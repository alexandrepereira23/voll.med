import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <select
        ref={ref}
        {...props}
        className={`
          w-full px-3 py-2.5 rounded-md bg-white border text-text-primary text-sm
          focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
          transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-danger' : 'border-border'} ${className}
        `}
      >
        {children}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
)

Select.displayName = 'Select'
