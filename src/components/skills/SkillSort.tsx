'use client'

import { cn } from '@/lib/utils'
import { SORT_OPTIONS } from '@/constants'
import type { SortOption } from '@/types'

interface SkillSortProps {
  activeSort: SortOption
  onSortChange: (sort: SortOption) => void
}

export default function SkillSort({
  activeSort,
  onSortChange,
}: SkillSortProps) {
  return (
    <div className="flex gap-1">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onSortChange(option.value as SortOption)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150',
            activeSort === option.value
              ? 'bg-[#F5F5F5] text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
