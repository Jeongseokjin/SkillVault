'use client'

import { cn } from '@/lib/utils'

const VARIANT_STYLES = {
  default: 'bg-[#F5F5F5] text-text-secondary',
  success: 'bg-[#F0FDF4] text-success',
  warning: 'bg-[#FFFBEB] text-warning',
  error: 'bg-[#FEF2F2] text-error',
  info: 'bg-[#F5F3FF] text-premium',
} as const

const SIZE_STYLES = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-[11px]',
} as const

type BadgeVariant = keyof typeof VARIANT_STYLES
type BadgeSize = keyof typeof SIZE_STYLES

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: React.ReactNode
}

export default function Badge({
  variant = 'default',
  size = 'md',
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-semibold tracking-wide',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size]
      )}
    >
      {children}
    </span>
  )
}
