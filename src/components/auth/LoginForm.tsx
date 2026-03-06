'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginSchema } from '@/lib/validations/auth'
import { Input, Button } from '@/components/ui'
import { ROUTES } from '@/constants'

export default function LoginForm() {
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? ROUTES.HOME

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(formData: LoginSchema) {
    setServerError('')
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      setServerError(
        error.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다'
          : '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요'
      )
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
      {serverError && (
        <div className="rounded-lg border border-error/20 bg-[#FEF2F2] px-4 py-3 text-sm text-error">
          {serverError}
        </div>
      )}

      <Input
        label="이메일"
        type="email"
        autoComplete="email"
        placeholder="email@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="비밀번호"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="비밀번호를 입력하세요"
        error={errors.password?.message}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-text-tertiary transition-colors hover:text-text-secondary"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        {...register('password')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
      >
        로그인
      </Button>

      <p className="text-center text-sm text-text-secondary">
        계정이 없으신가요?{' '}
        <Link
          href={ROUTES.SIGNUP}
          className="font-semibold text-text-primary hover:underline"
        >
          회원가입
        </Link>
      </p>
    </form>
  )
}
