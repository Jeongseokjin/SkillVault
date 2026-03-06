'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupSchema } from '@/lib/validations/auth'
import { Input, Button } from '@/components/ui'
import { ROUTES } from '@/constants'

export default function SignupForm() {
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(formData: SignupSchema) {
    setServerError('')
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          username: formData.username,
        },
      },
    })

    if (error) {
      setServerError(
        error.message.includes('already registered')
          ? '이미 가입된 이메일입니다'
          : '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요'
      )
      return
    }

    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <div className="w-full text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4]">
          <Mail size={28} className="text-success" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-text-primary">
          이메일을 확인해주세요!
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-text-secondary">
          입력하신 이메일로 인증 링크를 보냈습니다.
          <br />
          인증 후 로그인할 수 있어요
        </p>
        <Link href={ROUTES.LOGIN}>
          <Button variant="primary" size="lg">
            로그인 페이지로
          </Button>
        </Link>
      </div>
    )
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
        label="유저명"
        type="text"
        autoComplete="username"
        placeholder="유저명을 입력하세요"
        hint="한글, 영문, 숫자, _ 사용 가능"
        error={errors.username?.message}
        {...register('username')}
      />

      <Input
        label="비밀번호"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="비밀번호를 입력하세요"
        hint="영문+숫자 포함 8자 이상"
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

      <Input
        label="비밀번호 확인"
        type={showConfirm ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="비밀번호를 다시 입력하세요"
        error={errors.confirmPassword?.message}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="text-text-tertiary transition-colors hover:text-text-secondary"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
      >
        회원가입
      </Button>

      <p className="text-center text-sm text-text-secondary">
        이미 계정이 있으신가요?{' '}
        <Link
          href={ROUTES.LOGIN}
          className="font-semibold text-text-primary hover:underline"
        >
          로그인
        </Link>
      </p>
    </form>
  )
}
