'use client'

import { use } from 'react'
import { Navbar } from '@/components/layout'
import { SkillDetailContent } from '@/components/skills'
import { useAuth } from '@/hooks/useAuth'

interface SkillDetailPageProps {
  params: Promise<{ id: string }>
}

export default function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { id } = use(params)
  const { user, isLoading } = useAuth()

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <SkillDetailContent
            skillId={id}
            userId={user?.id ?? null}
          />
        )}
      </main>
    </>
  )
}
