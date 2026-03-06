'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h2 className="mb-4 text-xl font-bold text-text-primary">
          문제가 발생했습니다
        </h2>
        <p className="mb-8 text-sm text-text-secondary">
          페이지를 불러오는 중 오류가 발생했습니다.
        </p>
        <Button variant="primary" size="lg" onClick={reset}>
          다시 시도
        </Button>
      </div>
    </div>
  )
}
