import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className = '', onClick, padding = 'md' }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-zinc-100 shadow-sm ${paddings[padding]} ${
        onClick ? 'cursor-pointer hover:border-brand-300 hover:shadow-md transition-all' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'amber'
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${colors[color]}`}>
      {children}
    </span>
  )
}
