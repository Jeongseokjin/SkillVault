'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Package, Heart, MessageSquare, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout'
import { SkillCard } from '@/components/skills'
import { Button, Avatar, EmptyState } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useBookmarks, useBookmarkToggle } from '@/hooks/useBookmarks'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import type { SkillWithAuthor, Review, Skill } from '@/types'

type TabValue = 'skills' | 'bookmarks' | 'reviews'

const TABS: { value: TabValue; label: string; icon: React.ElementType }[] = [
  { value: 'skills', label: '내 스킬', icon: Package },
  { value: 'bookmarks', label: '즐겨찾기', icon: Heart },
  { value: 'reviews', label: '내 리뷰', icon: MessageSquare },
]

interface ReviewWithSkill extends Review {
  skill: Pick<Skill, 'id' | 'title'> | null
}

export default function MyPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabValue>('skills')
  const [mySkills, setMySkills] = useState<SkillWithAuthor[]>([])
  const [myReviews, setMyReviews] = useState<ReviewWithSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { data: bookmarks } = useBookmarks(user?.id)
  const bookmarkToggle = useBookmarkToggle(user?.id)

  const bookmarkedIds = new Set(
    bookmarks?.map((bookmark) => bookmark.skill_id) ?? []
  )

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push(ROUTES.LOGIN)
      return
    }
    fetchData()
  }, [user, authLoading])

  async function fetchData() {
    if (!user) return
    setIsLoading(true)
    const supabase = createClient()

    const [skillsResult, reviewsResult] = await Promise.all([
      supabase
        .from('skills')
        .select('*, author:profiles!skills_author_id_fkey(*)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('reviews')
        .select('*, skill:skills!reviews_skill_id_fkey(id, title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    setMySkills((skillsResult.data ?? []) as SkillWithAuthor[])
    setMyReviews((reviewsResult.data ?? []) as ReviewWithSkill[])
    setIsLoading(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(ROUTES.HOME)
  }

  function handleBookmarkToggle(skillId: string) {
    bookmarkToggle.mutate({
      skillId,
      isBookmarked: bookmarkedIds.has(skillId),
    })
  }

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        </main>
      </>
    )
  }

  if (!user || !profile) return null

  const bookmarkedSkills = (bookmarks ?? [])
    .filter((bookmark): bookmark is typeof bookmark & { skill: Skill } => Boolean(bookmark.skill))
    .map((bookmark) => ({
      ...bookmark.skill,
      author: profile,
    })) as SkillWithAuthor[]

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.avatar_url}
              username={profile.username}
              size="lg"
            />
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                {profile.username}
              </h1>
              <p className="text-sm text-text-secondary">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={ROUTES.SKILL_UPLOAD}>
              <Button variant="primary" size="md">
                스킬 등록
              </Button>
            </Link>
            <Button variant="ghost" size="md" onClick={handleLogout}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl border border-border bg-surface p-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors duration-150',
                  activeTab === tab.value
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:bg-[#F5F5F5]'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <>
            {activeTab === 'skills' && (
              <MySkillsTab
                skills={mySkills}
                bookmarkedIds={bookmarkedIds}
                onBookmarkToggle={handleBookmarkToggle}
              />
            )}
            {activeTab === 'bookmarks' && (
              <MyBookmarksTab
                skills={bookmarkedSkills}
                bookmarkedIds={bookmarkedIds}
                onBookmarkToggle={handleBookmarkToggle}
              />
            )}
            {activeTab === 'reviews' && (
              <MyReviewsTab reviews={myReviews} />
            )}
          </>
        )}
      </main>
    </>
  )
}

function MySkillsTab({
  skills,
  bookmarkedIds,
  onBookmarkToggle,
}: {
  skills: SkillWithAuthor[]
  bookmarkedIds: Set<string>
  onBookmarkToggle: (skillId: string) => void
}) {
  if (skills.length === 0) {
    return <EmptyState type="no-skills" />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          isBookmarked={bookmarkedIds.has(skill.id)}
          onBookmarkToggle={onBookmarkToggle}
          showStatus
        />
      ))}
    </div>
  )
}

function MyBookmarksTab({
  skills,
  bookmarkedIds,
  onBookmarkToggle,
}: {
  skills: SkillWithAuthor[]
  bookmarkedIds: Set<string>
  onBookmarkToggle: (skillId: string) => void
}) {
  if (skills.length === 0) {
    return <EmptyState type="no-bookmarks" />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          isBookmarked={bookmarkedIds.has(skill.id)}
          onBookmarkToggle={onBookmarkToggle}
        />
      ))}
    </div>
  )
}

function MyReviewsTab({ reviews }: { reviews: ReviewWithSkill[] }) {
  if (reviews.length === 0) {
    return <EmptyState type="no-reviews" />
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <div className="mb-2 flex items-center justify-between">
            {review.skill ? (
              <Link
                href={ROUTES.SKILL_DETAIL(review.skill.id)}
                className="text-sm font-semibold text-text-primary hover:underline"
              >
                {review.skill.title}
              </Link>
            ) : (
              <span className="text-sm text-text-tertiary">삭제된 스킬</span>
            )}
            <span className="text-xs text-text-tertiary">
              {new Date(review.created_at).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <div className="mb-2 flex items-center gap-1">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={cn(
                  'text-xs',
                  index < review.rating ? 'text-text-primary' : 'text-[#E5E5E5]'
                )}
              >
                ★
              </span>
            ))}
            <span className="ml-1 text-xs font-medium text-text-secondary">
              {review.rating}.0
            </span>
          </div>
          {review.comment && (
            <p className="text-sm leading-relaxed text-text-secondary">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
