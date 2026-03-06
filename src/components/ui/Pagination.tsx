'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const PAGE_RANGE = 2

function getPageNumbers(currentPage: number, totalPages: number): number[] {
  const start = Math.max(1, currentPage - PAGE_RANGE)
  const end = Math.min(totalPages, currentPage + PAGE_RANGE)
  const pages: number[] = []

  for (let page = start; page <= end; page++) {
    pages.push(page)
  }

  return pages
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150',
          isFirstPage
            ? 'cursor-not-allowed text-text-tertiary opacity-40'
            : 'text-text-secondary hover:bg-[#F5F5F5]'
        )}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors duration-150',
            page === currentPage
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:bg-[#F5F5F5]'
          )}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150',
          isLastPage
            ? 'cursor-not-allowed text-text-tertiary opacity-40'
            : 'text-text-secondary hover:bg-[#F5F5F5]'
        )}
        aria-label="다음 페이지"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
