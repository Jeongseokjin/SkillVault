'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button, Badge } from '@/components/ui'
import { ADMIN_ITEMS_PER_PAGE, ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import type { Report, ReportStatus } from '@/types'

type StatusFilter = 'all' | ReportStatus

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'resolved', label: '처리됨' },
  { value: 'dismissed', label: '기각' },
]

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: '대기',
  resolved: '처리됨',
  dismissed: '기각',
}

const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  pending: '#D97706',
  resolved: '#16A34A',
  dismissed: '#888888',
}

interface ReportWithRelations extends Omit<Report, 'skill' | 'reporter'> {
  skill: { id: string; title: string } | null
  reporter: { id: string; username: string | null; email: string } | null
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportWithRelations[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchReports()
  }, [statusFilter, page])

  async function fetchReports() {
    setIsLoading(true)
    const supabase = createClient()
    const from = (page - 1) * ADMIN_ITEMS_PER_PAGE
    const to = from + ADMIN_ITEMS_PER_PAGE - 1

    let query = supabase
      .from('reports')
      .select(
        '*, skill:skills!reports_skill_id_fkey(id, title), reporter:profiles!reports_reporter_id_fkey(id, username, email)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, count } = await query

    setReports((data ?? []) as ReportWithRelations[])
    setTotal(count ?? 0)
    setIsLoading(false)
  }

  async function updateStatus(reportId: string, status: ReportStatus) {
    const supabase = createClient()

    const { error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', reportId)

    if (error) {
      toast.error('상태 변경에 실패했습니다')
      return
    }

    toast.success(`${REPORT_STATUS_LABELS[status]}으로 변경되었습니다`)
    fetchReports()
  }

  const totalPages = Math.ceil(total / ADMIN_ITEMS_PER_PAGE)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-[-0.5px] text-text-primary">
        신고 관리
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
      ) : reports.length === 0 ? (
        <p className="py-20 text-center text-sm text-text-tertiary">
          신고가 없습니다
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-[#FAFAFA]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    대상 스킬
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    신고자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    사유
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    신고일
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-[#F0F0F0] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      {report.skill ? (
                        <Link
                          href={ROUTES.SKILL_DETAIL(report.skill.id)}
                          className="flex items-center gap-1 text-sm font-medium text-text-primary hover:underline"
                        >
                          {report.skill.title}
                          <ExternalLink size={12} className="text-text-tertiary" />
                        </Link>
                      ) : (
                        <span className="text-sm text-text-tertiary">삭제된 스킬</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {report.reporter?.username ?? report.reporter?.email ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default" size="sm">
                        {report.reason}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          backgroundColor: `${REPORT_STATUS_COLORS[report.status]}15`,
                          color: REPORT_STATUS_COLORS[report.status],
                        }}
                      >
                        {REPORT_STATUS_LABELS[report.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-tertiary">
                      {new Date(report.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {report.status === 'pending' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => updateStatus(report.id, 'resolved')}
                            >
                              처리
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(report.id, 'dismissed')}
                            >
                              기각
                            </Button>
                          </>
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
