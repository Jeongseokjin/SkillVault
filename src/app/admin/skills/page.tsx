'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button, Badge } from '@/components/ui'
import { ADMIN_ITEMS_PER_PAGE, ROUTES, SKILL_STATUS_LABELS, SKILL_STATUS_COLORS } from '@/constants'
import { cn } from '@/lib/utils'
import type { SkillWithAuthor, SkillStatus } from '@/types'

type StatusFilter = 'all' | SkillStatus

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '거절' },
]

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

    toast.success(`${SKILL_STATUS_LABELS[status]}으로 변경되었습니다`)
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
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-[#FAFAFA]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    제목
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    작성자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    카테고리
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    등록일
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr
                    key={skill.id}
                    className="border-b border-[#F0F0F0] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={ROUTES.SKILL_DETAIL(skill.id)}
                        className="flex items-center gap-1 text-sm font-medium text-text-primary hover:underline"
                      >
                        {skill.title}
                        <ExternalLink size={12} className="text-text-tertiary" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {skill.author.username ?? skill.author.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default" size="sm">
                        {skill.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          backgroundColor: `${SKILL_STATUS_COLORS[skill.status]}15`,
                          color: SKILL_STATUS_COLORS[skill.status],
                        }}
                      >
                        {SKILL_STATUS_LABELS[skill.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-tertiary">
                      {new Date(skill.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {skill.status !== 'approved' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => updateStatus(skill.id, 'approved')}
                          >
                            승인
                          </Button>
                        )}
                        {skill.status !== 'rejected' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => updateStatus(skill.id, 'rejected')}
                          >
                            거절
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
