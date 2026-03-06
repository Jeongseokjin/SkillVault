'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SkillSearch, SkillFilter, SkillSort, SkillGrid } from '@/components/skills'
import { EmptyState, Pagination } from '@/components/ui'
import { useSkills } from '@/hooks/useSkills'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks, useBookmarkToggle } from '@/hooks/useBookmarks'
import { useLikes, useLikeToggle } from '@/hooks/useLikes'
import { ITEMS_PER_PAGE, ROUTES } from '@/constants'
import type { Category, SortOption, SkillFilterValues } from '@/types'

function HeroBadge() {
  return (
    <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-[#F0F0F0] py-1 pl-1.5 pr-3">
      <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold tracking-[0.5px] text-white">
        NEW
      </span>
      <span className="text-xs font-medium text-text-secondary">
        누구나 스킬을 만들고 공유할 수 있어요
      </span>
    </div>
  )
}

interface StatCardProps {
  value: string
  label: string
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-5 text-center">
      <div className="text-[28px] font-bold tracking-[-1px] text-text-primary">
        {value}
      </div>
      <div className="mt-1 text-[13px] font-medium text-text-tertiary">
        {label}
      </div>
    </div>
  )
}

export default function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const category = (searchParams.get('category') ?? '전체') as Category | '전체'
  const sort = (searchParams.get('sort') ?? 'latest') as SortOption
  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? '1')

  const filters: SkillFilterValues = useMemo(
    () => ({ category, sort, search, page, limit: ITEMS_PER_PAGE }),
    [category, sort, search, page]
  )

  const { data, isLoading } = useSkills(filters)
  const { user } = useAuth()
  const { data: bookmarks } = useBookmarks(user?.id)
  const { mutate: toggleBookmark } = useBookmarkToggle(user?.id)
  const { data: likes } = useLikes(user?.id)
  const { mutate: toggleLike } = useLikeToggle(user?.id)

  const bookmarkedIds = useMemo(() => {
    if (!bookmarks) return new Set<string>()
    return new Set(bookmarks.map((bookmark) => bookmark.skill_id))
  }, [bookmarks])

  const likedIds = useMemo(() => {
    if (!likes) return new Set<string>()
    return new Set(likes.map((like) => like.skill_id))
  }, [likes])

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === '전체' || value === 'latest' || value === '1') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      const queryString = params.toString()
      router.push(queryString ? `/?${queryString}` : '/')
    },
    [router, searchParams]
  )

  function handleCategoryChange(value: Category | '전체') {
    updateParams({ category: value, page: '1' })
  }

  function handleSortChange(value: SortOption) {
    updateParams({ sort: value, page: '1' })
  }

  function handleSearch(query: string) {
    updateParams({ search: query, page: '1' })
  }

  function handlePageChange(value: number) {
    updateParams({ page: String(value) })
  }

  function handleBookmarkToggle(skillId: string) {
    if (!user) {
      router.push(ROUTES.LOGIN)
      return
    }
    toggleBookmark({ skillId, isBookmarked: bookmarkedIds.has(skillId) })
  }

  function handleLikeToggle(skillId: string) {
    if (!user) {
      router.push(ROUTES.LOGIN)
      return
    }
    toggleLike({ skillId, isLiked: likedIds.has(skillId) })
  }

  function handleSearchReset() {
    updateParams({ search: '', page: '1' })
  }

  const skills = data?.data ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.total ?? 0

  const uniqueAuthors = useMemo(() => {
    const ids = new Set(skills.map((skill) => skill.author_id))
    return ids.size
  }, [skills])

  const totalDownloads = useMemo(() => {
    return skills.reduce((sum, skill) => sum + skill.downloads, 0)
  }, [skills])

  return (
    <>
      <section className="mx-auto max-w-[960px] px-6 pb-16 pt-20 md:px-12">
        <HeroBadge />

        <h1 className="mb-5 text-[40px] font-bold leading-[1.05] tracking-[-2px] text-text-primary md:text-[56px]">
          AI 스킬을
          <br />
          <span className="bg-gradient-to-r from-accent to-text-secondary bg-clip-text text-transparent">
            찾고, 만들고, 공유하세요
          </span>
        </h1>

        <p className="mb-10 max-w-[480px] text-[17px] leading-relaxed text-[#666666]">
          Claude 에이전트 스킬을 한 곳에서.
          <br />
          검색 한 번으로 내 워크플로우에 바로 적용하세요.
        </p>

        <SkillSearch defaultValue={search} onSearch={handleSearch} />
      </section>

      <section className="mx-auto max-w-[960px] px-6 pb-20 md:px-12">
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard value={`${total}+`} label="등록된 스킬" />
          <StatCard value={totalDownloads.toLocaleString()} label="누적 다운로드" />
          <StatCard value={`${uniqueAuthors}명`} label="스킬 제작자" />
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SkillFilter
            activeCategory={category}
            onCategoryChange={handleCategoryChange}
          />
          <SkillSort activeSort={sort} onSortChange={handleSortChange} />
        </div>

        {!isLoading && skills.length === 0 ? (
          <EmptyState
            type={search ? 'no-search-result' : 'no-skills'}
            searchQuery={search}
            onReset={handleSearchReset}
          />
        ) : (
          <SkillGrid
            skills={skills}
            isLoading={isLoading}
            bookmarkedIds={bookmarkedIds}
            likedIds={likedIds}
            onBookmarkToggle={handleBookmarkToggle}
            onLikeToggle={handleLikeToggle}
          />
        )}

        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl bg-accent p-8 sm:flex-row sm:items-center sm:p-12">
          <div>
            <h2 className="mb-2 text-[28px] font-bold tracking-[-0.8px] text-white">
              나만의 스킬을 공유해보세요
            </h2>
            <p className="text-[15px] leading-relaxed text-text-tertiary">
              직접 만든 스킬을 등록하고
              <br />
              다른 사람들과 함께 사용하세요.
            </p>
          </div>
          <Link
            href={ROUTES.SKILL_UPLOAD}
            className="shrink-0 rounded-lg bg-white px-7 py-3.5 text-[15px] font-bold text-accent transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            스킬 업로드 →
          </Link>
        </div>
      </section>
    </>
  )
}
