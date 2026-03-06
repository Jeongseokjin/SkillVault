import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth'
import { ROUTES } from '@/constants'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-12">
        <div className="mb-8 text-center">
          <Link href={ROUTES.HOME} className="mb-6 inline-flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent">
              <span className="text-sm text-white">⬡</span>
            </div>
            <span className="text-[17px] font-bold tracking-[-0.3px] text-text-primary">
              SkillVault
            </span>
          </Link>
          <h1 className="mt-6 text-[28px] font-bold tracking-[-0.5px] text-text-primary">
            다시 오셨군요 👋
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            SkillVault에 로그인하세요
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
