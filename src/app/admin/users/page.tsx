'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button, Avatar, Badge } from '@/components/ui'
import { ADMIN_ITEMS_PER_PAGE } from '@/constants'
import type { Profile, UserRole } from '@/types'

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: '최고관리자',
  admin: '관리자',
  user: '일반유저',
}

const ROLE_BADGE_VARIANT: Record<UserRole, 'premium' | 'warning' | 'default'> = {
  superadmin: 'premium',
  admin: 'warning',
  user: 'default',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [page])

  async function fetchUsers() {
    setIsLoading(true)
    const supabase = createClient()
    const from = (page - 1) * ADMIN_ITEMS_PER_PAGE
    const to = from + ADMIN_ITEMS_PER_PAGE - 1

    const { data, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    setUsers((data ?? []) as Profile[])
    setTotal(count ?? 0)
    setIsLoading(false)
  }

  async function toggleBlock(userId: string, currentlyBlocked: boolean) {
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ is_blocked: !currentlyBlocked })
      .eq('id', userId)

    if (error) {
      toast.error('상태 변경에 실패했습니다')
      return
    }

    toast.success(currentlyBlocked ? '차단이 해제되었습니다' : '유저가 차단되었습니다')
    fetchUsers()
  }

  async function updateRole(userId: string, role: UserRole) {
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)

    if (error) {
      toast.error('역할 변경에 실패했습니다')
      return
    }

    toast.success(`${ROLE_LABELS[role]}로 변경되었습니다`)
    fetchUsers()
  }

  const totalPages = Math.ceil(total / ADMIN_ITEMS_PER_PAGE)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-[-0.5px] text-text-primary">
        유저 관리
      </h1>

      {users.length === 0 ? (
        <p className="py-20 text-center text-sm text-text-tertiary">
          유저가 없습니다
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-[#FAFAFA]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    유저
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    이메일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    역할
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                    가입일
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#F0F0F0] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={user.avatar_url}
                          username={user.username}
                          size="sm"
                        />
                        <span className="text-sm font-medium text-text-primary">
                          {user.username ?? '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_BADGE_VARIANT[user.role]} size="sm">
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_blocked ? (
                        <Badge variant="error" size="sm">차단됨</Badge>
                      ) : (
                        <Badge variant="success" size="sm">정상</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-tertiary">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {user.role === 'user' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateRole(user.id, 'admin')}
                          >
                            관리자 지정
                          </Button>
                        )}
                        {user.role === 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateRole(user.id, 'user')}
                          >
                            관리자 해제
                          </Button>
                        )}
                        {user.role !== 'superadmin' && (
                          <Button
                            variant={user.is_blocked ? 'secondary' : 'danger'}
                            size="sm"
                            onClick={() => toggleBlock(user.id, user.is_blocked)}
                          >
                            {user.is_blocked ? (
                              <span className="flex items-center gap-1">
                                <ShieldCheck size={12} /> 해제
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <ShieldAlert size={12} /> 차단
                              </span>
                            )}
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
