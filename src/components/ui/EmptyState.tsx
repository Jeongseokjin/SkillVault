'use client'

import Link from 'next/link'
import { PackageOpen, SearchX, Download, Bookmark, MessageSquare } from 'lucide-react'
import { ROUTES } from '@/constants'
import Button from './Button'

type EmptyStateType =
  | 'no-skills'
  | 'no-search-result'
  | 'no-downloads'
  | 'no-bookmarks'
  | 'no-reviews'

interface EmptyStateProps {
  type: EmptyStateType
  searchQuery?: string
  onReset?: () => void
}

const EMPTY_STATE_CONFIG = {
  'no-skills': {
    icon: PackageOpen,
    message: '아직 등록된 스킬이 없어요',
    actionLabel: '스킬 업로드하기',
    actionHref: ROUTES.SKILL_UPLOAD,
  },
  'no-search-result': {
    icon: SearchX,
    message: '',
    actionLabel: '검색어 초기화',
    actionHref: null,
  },
  'no-downloads': {
    icon: Download,
    message: '아직 다운로드한 스킬이 없어요',
    actionLabel: '스킬 탐색하기',
    actionHref: ROUTES.SKILLS,
  },
  'no-bookmarks': {
    icon: Bookmark,
    message: '즐겨찾기한 스킬이 없어요',
    actionLabel: '스킬 탐색하기',
    actionHref: ROUTES.SKILLS,
  },
  'no-reviews': {
    icon: MessageSquare,
    message: '아직 리뷰가 없어요. 첫 리뷰를 남겨보세요!',
    actionLabel: null,
    actionHref: null,
  },
} as const

export default function EmptyState({ type, searchQuery, onReset }: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type]
  const Icon = config.icon

  const message =
    type === 'no-search-result'
      ? `"${searchQuery}"에 대한 검색 결과가 없어요`
      : config.message

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon size={48} className="mb-4 text-text-tertiary" strokeWidth={1.5} />
      <p className="mb-6 text-[15px] font-medium text-text-secondary">
        {message}
      </p>
      {type === 'no-search-result' && onReset && (
        <Button variant="secondary" size="md" onClick={onReset}>
          검색어 초기화
        </Button>
      )}
      {config.actionHref && (
        <Link href={config.actionHref}>
          <Button variant="primary" size="md">
            {config.actionLabel}
          </Button>
        </Link>
      )}
    </div>
  )
}
