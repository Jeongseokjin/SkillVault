'use client'

import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/constants'
import type { Category } from '@/types'

type FilterCategory = Category | '전체'

interface SkillFilterProps {
  activeCategory: FilterCategory
  onCategoryChange: (category: FilterCategory) => void
}

export default function SkillFilter({
  activeCategory,
  onCategoryChange,
}: SkillFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value as FilterCategory)}
          className={cn(
            'rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-all duration-150',
            activeCategory === category.value
              ? 'border-accent bg-accent text-white'
              : 'border-[#E5E5E5] bg-surface text-text-secondary hover:border-text-tertiary'
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
