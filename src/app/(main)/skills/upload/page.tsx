'use client'

import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout'
import { SkillUploadForm } from '@/components/skills'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants'

export default function SkillUploadPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        </main>
      </>
    )
  }

  if (!user) {
    router.push(ROUTES.LOGIN)
    return null
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-bold tracking-[-0.5px] text-text-primary">
          스킬 등록
        </h1>
        <SkillUploadForm userId={user.id} />
      </main>
    </>
  )
}
