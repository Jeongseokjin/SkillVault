'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import Spinner from './Spinner'

const VARIANT_STYLES = {
  primary:
    'bg-accent text-white hover:scale-[1.02] active:scale-[0.98]',
  secondary:
    'bg-[#F5F5F5] text-accent hover:bg-border',
  outline:
    'border-[1.5px] border-accent bg-transparent text-accent hover:bg-accent hover:text-white',
  ghost:
    'bg-transparent text-text-secondary hover:bg-[#F5F5F5]',
  danger:
    'bg-error text-white hover:bg-[#B91C1C]',
} as const

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-[13px] rounded-md',
  md: 'px-5 py-2.5 text-[15px] rounded-[10px]',
  lg: 'px-7 py-3.5 text-base rounded-lg',
} as const

type ButtonVariant = keyof typeof VARIANT_STYLES
type ButtonSize = keyof typeof SIZE_STYLES

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          fullWidth && 'w-full',
          isDisabled && 'pointer-events-none opacity-50',
          isLoading && 'opacity-70',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} color="currentColor" />
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
