'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

const SIZE_STYLES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
} as const

interface AvatarProps {
  src?: string | null
  username?: string | null
  size?: keyof typeof SIZE_STYLES
}

function getInitial(username: string | null | undefined): string {
  if (!username) return '?'
  return username.charAt(0).toUpperCase()
}

export default function Avatar({ src, username, size = 'md' }: AvatarProps) {
  if (src) {
    return (
      <div className={cn('relative shrink-0 overflow-hidden rounded-full', SIZE_STYLES[size])}>
        <Image
          src={src}
          alt={username ?? '프로필'}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-[#F0F0F0] font-semibold text-text-secondary',
        SIZE_STYLES[size]
      )}
    >
      {getInitial(username)}
    </div>
  )
}
