'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Package,
  Tag,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button, Badge, Avatar } from '@/components/ui'
import {
  ADMIN_ITEMS_PER_PAGE,
  ROUTES,
  SKILL_STATUS_LABELS,
  SKILL_STATUS_COLORS,
} from '@/constants'
import { cn } from '@/lib/utils'
import type { SkillWithAuthor, SkillStatus } from '@/types'

type StatusFilter = 'all' | SkillStatus

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '거절' },
]

function SkillCard({
  skill,
  onApprove,
  onReject,
  onDelete,
}: {
  skill: SkillWithAuthor
  onApprove: () => void
  onReject: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={skill.author.avatar_url}
            username={skill.author.username}
            size="sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.SKILL_DETAIL(skill.id)}
                className="text-sm font-bold text-text-primary hover:underline"
              >
                {skill.title}
              </Link>
              <ExternalLink size={12} className="text-text-tertiary" />
            </div>
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <span>{skill.author.username ?? skill.author.email}</span>
              <span>·</span>
              <span>{skill.category}</span>
              <span>·</span>
              <span>
                {new Date(skill.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{
              backgroundColor: `${SKILL_STATUS_COLORS[skill.status]}15`,
              color: SKILL_STATUS_COLORS[skill.status],
            }}
          >
            {SKILL_STATUS_LABELS[skill.status]}
          </span>

          {skill.npm_package_name && (
            <Badge variant="success" size="sm">
              MCP
            </Badge>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 rounded-md p-1 text-text-tertiary transition-colors hover:bg-[#F5F5F5] hover:text-text-primary"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#F0F0F0] px-5 py-4">
          {skill.description && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-text-secondary">설명</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {skill.description}
              </p>
            </div>
          )}

          {skill.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <Tag size={12} className="text-text-tertiary" />
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-[#F5F5F5] px-2 py-0.5 text-[11px] font-medium text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mb-4 flex items-center gap-4 text-xs text-text-tertiary">
            <span className="flex items-center gap-1">
              <Package size={12} />
              v{skill.version}
            </span>
            {skill.npm_package_name && (
              <span className="font-mono text-success">
                {skill.npm_package_name}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {skill.status !== 'approved' && (
              <Button variant="primary" size="sm" onClick={onApprove}>
                승인 + MCP 배포
              </Button>
            )}
            {skill.status !== 'rejected' && (
              <Button variant="danger" size="sm" onClick={onReject}>
                거절
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('이 스킬을 완전히 삭제하시겠습니까? 복구할 수 없습니다.')) {
                  onDelete()
                }
              }}
            >
              삭제
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillWithAuthor[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchSkills()
  }, [statusFilter, page])

  async function fetchSkills() {
    setIsLoading(true)
    const supabase = createClient()
    const from = (page - 1) * ADMIN_ITEMS_PER_PAGE
    const to = from + ADMIN_ITEMS_PER_PAGE - 1

    let query = supabase
      .from('skills')
      .select('*, author:profiles!skills_author_id_fkey(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, count } = await query

    setSkills((data ?? []) as SkillWithAuthor[])
    setTotal(count ?? 0)
    setIsLoading(false)
  }

  async function updateStatus(skillId: string, status: SkillStatus) {
    const supabase = createClient()

    const { error } = await supabase
      .from('skills')
      .update({ status })
      .eq('id', skillId)

    if (error) {
      toast.error('상태 변경에 실패했습니다')
      return
    }

    if (status === 'approved') {
      toast.loading('승인 완료, MCP 패키지 배포 중...', { id: 'publish' })

      try {
        const res = await fetch(`/api/skills/${skillId}/publish`, {
          method: 'POST',
        })
        const result = await res.json()

        if (res.ok) {
          toast.success(`승인 + MCP 배포 완료: ${result.data.packageName}`, {
            id: 'publish',
          })
        } else {
          toast.error(`승인됨, 배포 실패: ${result.error}`, { id: 'publish' })
        }
      } catch {
        toast.error('승인됨, 배포 중 오류 발생', { id: 'publish' })
      }
    } else {
      toast.success(`${SKILL_STATUS_LABELS[status]}으로 변경되었습니다`)
    }

    fetchSkills()
  }

  async function deleteSkill(skillId: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', skillId)

    if (error) {
      toast.error('삭제에 실패했습니다')
      return
    }

    toast.success('스킬이 삭제되었습니다')
    fetchSkills()
  }

  const totalPages = Math.ceil(total / ADMIN_ITEMS_PER_PAGE)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-[-0.5px] text-text-primary">
        스킬 관리
      </h1>

      <div className="mb-4 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value)
              setPage(1)
            }}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150',
              statusFilter === tab.value
                ? 'bg-accent text-white'
                : 'bg-[#F5F5F5] text-text-secondary hover:bg-border'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : skills.length === 0 ? (
        <p className="py-20 text-center text-sm text-text-tertiary">
          스킬이 없습니다
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onApprove={() => updateStatus(skill.id, 'approved')}
                onReject={() => updateStatus(skill.id, 'rejected')}
                onDelete={() => deleteSkill(skill.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                이전
              </Button>
              <span className="text-sm text-text-secondary">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
