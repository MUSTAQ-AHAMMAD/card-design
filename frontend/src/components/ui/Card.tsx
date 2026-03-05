import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className, padding = 'md', hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        'transition-all duration-200',
        hover && 'hover:shadow-md hover:-translate-y-0.5',
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
