import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          {...props}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 ${
            error
              ? 'border-red-400 focus:ring-red-300'
              : 'border-zinc-200 hover:border-zinc-300'
          } ${leftIcon ? 'pl-9' : ''} ${className}`}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  )
}
