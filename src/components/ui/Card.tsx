'use client'

import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border-[1.5px] border-border bg-surface p-6',
        hover && 'transition-all duration-200 hover:-translate-y-1 hover:border-border-hover hover:shadow-hover',
        className
      )}
    >
      {children}
    </div>
  )
}
