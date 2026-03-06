'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Users, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { ROUTES } from '@/constants'

interface SidebarLink {
  label: string
  href: string
  icon: React.ElementType
  badgeKey: 'pendingSkills' | 'pendingReports' | null
}

const SIDEBAR_LINKS: SidebarLink[] = [
  { label: '대시보드', href: ROUTES.ADMIN, icon: LayoutDashboard, badgeKey: null },
  { label: '스킬 관리', href: ROUTES.ADMIN_SKILLS, icon: Package, badgeKey: 'pendingSkills' },
  { label: '유저 관리', href: ROUTES.ADMIN_USERS, icon: Users, badgeKey: null },
  { label: '신고 관리', href: ROUTES.ADMIN_REPORTS, icon: Flag, badgeKey: 'pendingReports' },
]

interface PendingCounts {
  pendingSkills: number
  pendingReports: number
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const [counts, setCounts] = useState<PendingCounts>({
    pendingSkills: 0,
    pendingReports: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    fetchCounts()
  }, [])

  async function fetchCounts() {
    const [skillsResult, reportsResult] = await Promise.all([
      supabase
        .from('skills')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ])

    setCounts({
      pendingSkills: skillsResult.count ?? 0,
      pendingReports: reportsResult.count ?? 0,
    })
  }

  function isActive(href: string) {
    if (href === ROUTES.ADMIN) return pathname === ROUTES.ADMIN
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface">
      <div className="px-4 py-6">
        <h2 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          관리자
        </h2>
        <nav className="flex flex-col gap-1">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            const badgeCount = link.badgeKey ? counts[link.badgeKey] : 0

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                  active
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:bg-[#F5F5F5]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  {link.label}
                </div>
                {badgeCount > 0 && (
                  <span
                    className={cn(
                      'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                      active
                        ? 'bg-white text-accent'
                        : 'bg-error text-white'
                    )}
                  >
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
