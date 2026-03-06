'use client'

import { SkillCardSkeleton } from '@/components/ui'
import SkillCard from './SkillCard'
import type { SkillWithAuthor } from '@/types'

const SKELETON_COUNT = 12

interface SkillGridProps {
  skills: SkillWithAuthor[]
  isLoading: boolean
  bookmarkedIds?: Set<string>
  onBookmarkToggle?: (skillId: string) => void
  showStatus?: boolean
}

export default function SkillGrid({
  skills,
  isLoading,
  bookmarkedIds,
  onBookmarkToggle,
  showStatus = false,
}: SkillGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <SkillCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          isBookmarked={bookmarkedIds?.has(skill.id)}
          onBookmarkToggle={onBookmarkToggle}
          showStatus={showStatus}
        />
      ))}
    </div>
  )
}
