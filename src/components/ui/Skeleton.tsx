'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[#F0F0F0]', className)}
    />
  )
}

export function SkillCardSkeleton() {
  return (
    <div className="rounded-xl border-[1.5px] border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-[10px]" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-1 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <div className="mb-4 flex gap-1.5">
        <Skeleton className="h-5 w-12 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
        <Skeleton className="h-5 w-10 rounded" />
      </div>
      <div className="border-t border-[#F0F0F0] pt-3.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}
