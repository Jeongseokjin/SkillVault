'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Star,
  Download,
  Heart,
  Flag,
  ArrowLeft,
  Calendar,
  Tag,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSkillDetail } from '@/hooks/useSkillDetail'
import { useBookmarks, useBookmarkToggle } from '@/hooks/useBookmarks'
import { reviewSchema, type ReviewSchema } from '@/lib/validations/skill'
import { Button, Avatar, Badge, Textarea } from '@/components/ui'
import { SkillReportModal } from '@/components/skills'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import type { Review } from '@/types'

interface SkillDetailContentProps {
  skillId: string
  userId: string | null
}

function StarRatingDisplay({ rating }: { rating: number }) {
  const rounded = Math.round(rating)

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={16}
            className={cn(
              index < rounded
                ? 'fill-text-primary text-text-primary'
                : 'fill-[#E5E5E5] text-[#E5E5E5]'
            )}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-text-primary">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (rating: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1
        return (
          <button
            key={index}
            type="button"
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(starValue)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={24}
              className={cn(
                starValue <= (hovered || value)
                  ? 'fill-text-primary text-text-primary'
                  : 'fill-[#E5E5E5] text-[#E5E5E5]'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

function ReviewItem({ review }: { review: Review }) {
  const rounded = Math.round(review.rating)

  return (
    <div className="border-b border-[#F0F0F0] py-4 last:border-b-0">
      <div className="mb-2 flex items-center gap-3">
        <Avatar
          src={review.user?.avatar_url}
          username={review.user?.username}
          size="sm"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">
            {review.user?.username ?? '알 수 없음'}
          </p>
          <div className="flex items-center gap-2">
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
            <span className="text-xs text-text-tertiary">
              {new Date(review.created_at).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
      </div>
      {review.comment && (
        <p className="text-sm leading-relaxed text-text-secondary">
          {review.comment}
        </p>
      )}
    </div>
  )
}

function ReviewForm({
  skillId,
  userId,
  onSuccess,
}: {
  skillId: string
  userId: string
  onSuccess: () => void
}) {
  const [ratingValue, setRatingValue] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewSchema>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  })

  function handleRatingChange(rating: number) {
    setRatingValue(rating)
    setValue('rating', rating, { shouldValidate: true })
  }

  async function onSubmit(formData: ReviewSchema) {
    const supabase = createClient()

    const { error } = await supabase.from('reviews').insert({
      skill_id: skillId,
      user_id: userId,
      rating: formData.rating,
      comment: formData.comment || null,
    })

    if (error) {
      if (error.code === '23505') {
        toast.error('이미 리뷰를 작성했습니다')
        return
      }
      toast.error('리뷰 작성에 실패했습니다')
      return
    }

    toast.success('리뷰가 등록되었습니다')
    reset()
    setRatingValue(0)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-text-primary">별점</p>
        <StarRatingInput value={ratingValue} onChange={handleRatingChange} />
        {errors.rating && (
          <p className="mt-1 text-xs text-error">{errors.rating.message}</p>
        )}
      </div>
      <Textarea
        label="리뷰 (선택)"
        placeholder="이 스킬에 대한 의견을 남겨주세요"
        rows={3}
        error={errors.comment?.message}
        {...register('comment')}
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isSubmitting}
      >
        리뷰 등록
      </Button>
    </form>
  )
}

export default function SkillDetailContent({
  skillId,
  userId,
}: SkillDetailContentProps) {
  const router = useRouter()
  const [isReportOpen, setIsReportOpen] = useState(false)

  const { data, isLoading, error, refetch } = useSkillDetail(skillId)
  const { data: bookmarks } = useBookmarks(userId ?? undefined)
  const bookmarkToggle = useBookmarkToggle(userId ?? undefined)

  const isBookmarked = bookmarks?.some(
    (bookmark) => bookmark.skill_id === skillId
  ) ?? false

  function handleBookmarkClick() {
    if (!userId) {
      toast.error('로그인이 필요합니다')
      return
    }
    bookmarkToggle.mutate({ skillId, isBookmarked })
  }

  async function handleDownload() {
    if (!data?.skill.file_url) {
      toast.error('다운로드할 파일이 없습니다')
      return
    }

    if (!userId) {
      toast.error('로그인이 필요합니다')
      return
    }

    try {
      const supabase = createClient()

      await supabase.from('downloads').insert({
        skill_id: skillId,
        user_id: userId,
      })

      window.open(data.skill.file_url, '_blank')
      toast.success('다운로드가 시작되었습니다')
    } catch {
      toast.error('다운로드 중 오류가 발생했습니다')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-text-secondary">
          스킬 정보를 불러올 수 없습니다
        </p>
        <Button variant="outline" size="md" onClick={() => router.push(ROUTES.HOME)}>
          홈으로 돌아가기
        </Button>
      </div>
    )
  }

  const { skill, reviews } = data
  const isPremium = skill.price === 'premium'
  const isAuthor = userId === skill.author_id

  return (
    <>
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={16} />
        뒤로가기
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {skill.preview_url && (
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border">
              <Image
                src={skill.preview_url}
                alt={skill.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="default" size="md">
                {skill.category}
              </Badge>
              <Badge variant={isPremium ? 'premium' : 'free'} size="md">
                {isPremium ? '프리미엄' : '무료'}
              </Badge>
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-[-0.5px] text-text-primary">
              {skill.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-text-tertiary">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(skill.created_at).toLocaleDateString('ko-KR')}
              </span>
              <span>v{skill.version}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-3 text-base font-bold text-text-primary">설명</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
              {skill.description}
            </p>
          </div>

          {skill.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag size={14} className="text-text-tertiary" />
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[#F5F5F5] px-2.5 py-1 text-xs font-medium text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-base font-bold text-text-primary">
              리뷰 ({reviews.length})
            </h2>

            {userId && !isAuthor && (
              <div className="mb-6 border-b border-[#F0F0F0] pb-6">
                <ReviewForm
                  skillId={skillId}
                  userId={userId}
                  onSuccess={() => refetch()}
                />
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="py-4 text-center text-sm text-text-tertiary">
                아직 리뷰가 없습니다
              </p>
            ) : (
              <div>
                {reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4 flex items-center gap-3">
                <Avatar
                  src={skill.author.avatar_url}
                  username={skill.author.username}
                  size="md"
                />
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {skill.author.username}
                  </p>
                  <p className="text-xs text-text-tertiary">제작자</p>
                </div>
              </div>

              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">평점</span>
                  <StarRatingDisplay rating={skill.rating} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">리뷰</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {skill.rating_count}개
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">다운로드</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {skill.downloads.toLocaleString()}회
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleDownload}
                >
                  <Download size={16} />
                  다운로드
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant={isBookmarked ? 'secondary' : 'outline'}
                    size="md"
                    fullWidth
                    onClick={handleBookmarkClick}
                  >
                    <Heart
                      size={14}
                      className={cn(
                        isBookmarked ? 'fill-error text-error' : ''
                      )}
                    />
                    {isBookmarked ? '저장됨' : '저장'}
                  </Button>
                  {userId && !isAuthor && (
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => setIsReportOpen(true)}
                    >
                      <Flag size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {userId && !isAuthor && (
        <SkillReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          skillId={skillId}
          userId={userId}
        />
      )}
    </>
  )
}