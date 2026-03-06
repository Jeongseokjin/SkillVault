'use client'

import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'h-4 w-4 border-[1.5px]',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-2',
} as const

interface SpinnerProps {
  size?: keyof typeof SIZES
  color?: string
}

export default function Spinner({ size = 'md', color = 'currentColor' }: SpinnerProps) {
  return (
    <div
      className={cn('animate-spin rounded-full border-transparent', SIZES[size])}
      style={{
        borderTopColor: color,
        borderRightColor: color,
      }}
      role="status"
      aria-label="로딩 중"
    />
  )
}
