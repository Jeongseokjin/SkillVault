'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Heart,
  Download,
  Bookmark,
  Flag,
  ArrowLeft,
  Calendar,
  Tag,
  Package,
  Copy,
  Check,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSkillDetail } from '@/hooks/useSkillDetail'
import { useBookmarks, useBookmarkToggle } from '@/hooks/useBookmarks'
import { useLikes, useLikeToggle } from '@/hooks/useLikes'
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

function ReviewItem({ review }: { review: Review }) {
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
          <span className="text-xs text-text-tertiary">
            {new Date(review.created_at).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">
        {review.comment}
      </p>
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewSchema>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { comment: '' },
  })

  async function onSubmit(formData: ReviewSchema) {
    const supabase = createClient()

    const { error } = await supabase.from('reviews').insert({
      skill_id: skillId,
      user_id: userId,
      comment: formData.comment,
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
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Textarea
        label="리뷰"
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
  const [copied, setCopied] = useState(false)
  const [mcpCopied, setMcpCopied] = useState(false)

  const { data, isLoading, error, refetch } = useSkillDetail(skillId)
  const { data: bookmarks } = useBookmarks(userId ?? undefined)
  const bookmarkToggle = useBookmarkToggle(userId ?? undefined)
  const { data: likes } = useLikes(userId ?? undefined)
  const likeToggle = useLikeToggle(userId ?? undefined)

  const isBookmarked =
    bookmarks?.some((bookmark) => bookmark.skill_id === skillId) ?? false
  const isLiked = likes?.some((like) => like.skill_id === skillId) ?? false

  function handleBookmarkClick() {
    if (!userId) {
      toast.error('로그인이 필요합니다')
      return
    }
    bookmarkToggle.mutate({ skillId, isBookmarked })
  }

  function handleLikeClick() {
    if (!userId) {
      toast.error('로그인이 필요합니다')
      return
    }
    likeToggle.mutate({ skillId, isLiked })
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

  function handleCopyInstall(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('복사되었습니다')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCopyMcpConfig() {
    const config = JSON.stringify(
      {
        mcpServers: {
          skillvault: {
            type: 'http',
            url: 'https://skill-vault-sage.vercel.app/api/mcp',
          },
        },
      },
      null,
      2
    )
    navigator.clipboard.writeText(config)
    setMcpCopied(true)
    toast.success('복사되었습니다')
    setTimeout(() => setMcpCopied(false), 2000)
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
        <Button
          variant="outline"
          size="md"
          onClick={() => router.push(ROUTES.HOME)}
        >
          홈으로 돌아가기
        </Button>
      </div>
    )
  }

  const { skill, reviews } = data
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
                  src={skill.author?.avatar_url}
                  username={skill.author?.username ?? '알 수 없음'}
                  size="md"
                />
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {skill.author?.username ?? '알 수 없음'}
                  </p>
                  <p className="text-xs text-text-tertiary">제작자</p>
                </div>
              </div>

              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">좋아요</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-text-primary">
                    <Heart size={14} className="text-error" />
                    {skill.like_count}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">저장</span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-text-primary">
                    <Bookmark size={14} />
                    {skill.bookmark_count}
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
                    variant={isLiked ? 'secondary' : 'outline'}
                    size="md"
                    fullWidth
                    onClick={handleLikeClick}
                  >
                    <Heart
                      size={14}
                      className={cn(isLiked ? 'fill-error text-error' : '')}
                    />
                    {isLiked ? '좋아요 취소' : '좋아요'}
                  </Button>
                  <Button
                    variant={isBookmarked ? 'secondary' : 'outline'}
                    size="md"
                    fullWidth
                    onClick={handleBookmarkClick}
                  >
                    <Bookmark
                      size={14}
                      className={cn(
                        isBookmarked
                          ? 'fill-text-primary text-text-primary'
                          : ''
                      )}
                    />
                    {isBookmarked ? '저장됨' : '저장'}
                  </Button>
                </div>
                {userId && !isAuthor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => setIsReportOpen(true)}
                  >
                    <Flag size={14} />
                    신고
                  </Button>
                )}
              </div>
            </div>

            {skill.status === 'approved' && (
              <div className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Package size={16} className="text-accent" />
                  <h3 className="text-sm font-bold text-text-primary">
                    Claude Code에서 사용하기
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-[#1E1E1E] px-4 py-3 font-mono text-xs leading-relaxed text-[#D4D4D4]">
{`{
  "mcpServers": {
    "skillvault": {
      "type": "http",
      "url": "https://skill-vault-sage.vercel.app/api/mcp"
    }
  }
}`}
                    </pre>
                    <button
                      onClick={handleCopyMcpConfig}
                      className="absolute right-2 top-2 rounded-md p-1.5 text-[#888] transition-colors hover:bg-[#333] hover:text-white"
                      aria-label="복사"
                    >
                      {mcpCopied ? (
                        <Check size={14} className="text-success" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-text-tertiary">
                    프로젝트 루트 또는 ~/.claude/에 .mcp.json으로 저장하세요.
                    한 번만 설정하면 모든 스킬을 사용할 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {skill.npm_package_name && (
              <div className="rounded-xl border border-border bg-surface p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Package size={16} className="text-success" />
                  <h3 className="text-sm font-bold text-text-primary">
                    MCP 패키지
                  </h3>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      handleCopyInstall(`npx ${skill.npm_package_name}`)
                    }
                    className="flex w-full items-center justify-between rounded-lg bg-[#1E1E1E] px-4 py-3 text-left font-mono text-xs text-[#D4D4D4] transition-colors hover:bg-[#2D2D2D]"
                  >
                    <span>npx {skill.npm_package_name}</span>
                    {copied ? (
                      <Check size={14} className="text-success" />
                    ) : (
                      <Copy size={14} className="text-[#888]" />
                    )}
                  </button>
                  <p className="text-[11px] text-text-tertiary">
                    Claude Desktop 설정에 추가하여 사용할 수 있습니다
                  </p>
                </div>
              </div>
            )}
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
