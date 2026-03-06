'use client'

import { useRouter } from 'next/navigation'
import { Star, Heart, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES, SKILL_STATUS_LABELS, SKILL_STATUS_COLORS } from '@/constants'
import { Badge } from '@/components/ui'
import type { SkillWithAuthor, SkillStatus } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  '디자인/UI': '⬡',
  '개발': '◈',
  '마케팅': '◉',
  '기타': '◎',
}

const MAX_VISIBLE_TAGS = 3

interface SkillCardProps {
  skill: SkillWithAuthor
  isBookmarked?: boolean
  onBookmarkToggle?: (skillId: string) => void
  showStatus?: boolean
}

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating)

  return (
    <div className="flex items-center gap-1">
      <span className="text-[13px] font-bold text-text-primary">
        {rating.toFixed(1)}
      </span>
      <div className="flex gap-px">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={10}
            className={cn(
              index < rounded
                ? 'fill-text-primary text-text-primary'
                : 'fill-[#E5E5E5] text-[#E5E5E5]'
            )}
          />
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: SkillStatus }) {
  const label = SKILL_STATUS_LABELS[status]
  const color = SKILL_STATUS_COLORS[status]

  return (
    <span
      className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {label}
    </span>
  )
}

export default function SkillCard({
  skill,
  isBookmarked = false,
  onBookmarkToggle,
  showStatus = false,
}: SkillCardProps) {
  const router = useRouter()
  const icon = CATEGORY_ICONS[skill.category] ?? '◎'
  const isPremium = skill.price === 'premium'

  function handleCardClick() {
    router.push(ROUTES.SKILL_DETAIL(skill.id))
  }

  function handleBookmarkClick(event: React.MouseEvent) {
    event.stopPropagation()
    if (!onBookmarkToggle) return
    onBookmarkToggle(skill.id)
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'cursor-pointer rounded-xl border-[1.5px] border-border bg-surface p-6',
        'transition-all duration-200 ease-in-out',
        'hover:-translate-y-1 hover:border-border-hover hover:shadow-hover'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') return
        handleCardClick()
      }}
    >
      {showStatus && (
        <div className="mb-3">
          <StatusBadge status={skill.status} />
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#F5F5F5] text-lg">
          {icon}
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="default" size="md">
            {skill.category}
          </Badge>
          <Badge variant={isPremium ? 'premium' : 'free'} size="md">
            {isPremium ? '프리미엄' : '무료'}
          </Badge>
        </div>
      </div>

      <h3 className="mb-2 text-base font-bold tracking-[-0.3px] text-text-primary">
        {skill.title}
      </h3>

      <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-[#777777]">
        {skill.description}
      </p>

      {skill.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {skill.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
            <span
              key={tag}
              className="rounded bg-[#F5F5F5] px-[7px] py-0.5 text-[11px] font-medium text-text-secondary"
            >
              {tag}
            </span>
          ))}
          {skill.tags.length > MAX_VISIBLE_TAGS && (
            <span className="rounded bg-[#F5F5F5] px-[7px] py-0.5 text-[11px] font-medium text-text-tertiary">
              +{skill.tags.length - MAX_VISIBLE_TAGS}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#F0F0F0] pt-3.5">
        <StarRating rating={skill.rating} />
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-text-tertiary">
            <Download size={12} />
            {skill.downloads.toLocaleString()}
          </span>
          {onBookmarkToggle && (
            <button
              onClick={handleBookmarkClick}
              className="transition-colors duration-150"
              aria-label={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
            >
              <Heart
                size={14}
                className={cn(
                  isBookmarked
                    ? 'fill-error text-error'
                    : 'fill-transparent text-[#AAAAAA] hover:text-error'
                )}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
