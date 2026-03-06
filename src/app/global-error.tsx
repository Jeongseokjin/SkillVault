'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-[#0A0A0A]">
              오류가 발생했습니다
            </h1>
            <p className="mb-8 text-sm text-[#555555]">
              예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={reset}
              className="rounded-lg bg-[#111111] px-7 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:scale-[1.02]"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
