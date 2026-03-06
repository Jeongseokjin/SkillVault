'use client'

import { useEffect, useState } from 'react'
import { Package, Users, Download, Flag, TrendingUp, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { AdminStats } from '@/types'

const INITIAL_STATS: AdminStats = {
  totalSkills: 0,
  totalUsers: 0,
  totalDownloads: 0,
  pendingSkills: 0,
  pendingReports: 0,
  todayDownloads: 0,
  todaySignups: 0,
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  color: string
  bgColor: string
}

function StatCard({ label, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: bgColor }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary">
        {value.toLocaleString()}
      </p>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>(INITIAL_STATS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const supabase = createClient()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayISO = todayStart.toISOString()

    const [skills, users, downloads, pendingSkills, pendingReports, todayDownloads, todaySignups] =
      await Promise.all([
        supabase.from('skills').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('downloads').select('*', { count: 'exact', head: true }),
        supabase.from('skills').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('downloads').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
      ])

    setStats({
      totalSkills: skills.count ?? 0,
      totalUsers: users.count ?? 0,
      totalDownloads: downloads.count ?? 0,
      pendingSkills: pendingSkills.count ?? 0,
      pendingReports: pendingReports.count ?? 0,
      todayDownloads: todayDownloads.count ?? 0,
      todaySignups: todaySignups.count ?? 0,
    })

    setIsLoading(false)
  }

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
        대시보드
      </h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="전체 스킬"
          value={stats.totalSkills}
          icon={Package}
          color="#111111"
          bgColor="#F5F5F5"
        />
        <StatCard
          label="전체 유저"
          value={stats.totalUsers}
          icon={Users}
          color="#7C3AED"
          bgColor="#F5F3FF"
        />
        <StatCard
          label="전체 다운로드"
          value={stats.totalDownloads}
          icon={Download}
          color="#16A34A"
          bgColor="#F0FDF4"
        />
        <StatCard
          label="대기 중 신고"
          value={stats.pendingReports}
          icon={Flag}
          color="#DC2626"
          bgColor="#FEF2F2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="승인 대기 스킬"
          value={stats.pendingSkills}
          icon={Package}
          color="#D97706"
          bgColor="#FFFBEB"
        />
        <StatCard
          label="오늘 다운로드"
          value={stats.todayDownloads}
          icon={TrendingUp}
          color="#16A34A"
          bgColor="#F0FDF4"
        />
        <StatCard
          label="오늘 가입"
          value={stats.todaySignups}
          icon={UserPlus}
          color="#7C3AED"
          bgColor="#F5F3FF"
        />
      </div>
    </div>
  )
}
