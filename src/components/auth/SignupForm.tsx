'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupSchema } from '@/lib/validations/auth'
import { Input, Button } from '@/components/ui'
import { ROUTES } from '@/constants'

type Step = 'form' | 'verify'

export default function SignupForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [signupEmail, setSignupEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  const checkDuplicate = useCallback(
    async (field: 'email' | 'username', value: string) => {
      if (!value) return

      try {
        const res = await fetch('/api/auth/check-duplicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        })

        if (!res.ok) {
          const data = await res.json()
          setError(field, { type: 'manual', message: data.error })
        }
      } catch {
        // 네트워크 에러는 무시 (제출 시 다시 체크)
      }
    },
    [setError]
  )

  async function onSubmit(formData: SignupSchema) {
    setServerError('')

    // 이메일 + 유저명 중복 체크 (서버 API)
    try {
      const checkRes = await fetch('/api/auth/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
        }),
      })

      const checkData = await checkRes.json()

      if (!checkRes.ok) {
        if (checkData.field) {
          setError(checkData.field as 'email' | 'username', {
            type: 'manual',
            message: checkData.error,
          })
        } else {
          setServerError(checkData.error || '중복 확인 중 오류가 발생했습니다')
        }
        return
      }
    } catch {
      setServerError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요')
      return
    }

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
      setServerError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요')
      return
    }

    setSignupEmail(formData.email)
    setStep('verify')
  }

  async function handleVerifyOtp() {
    if (otpCode.length !== 6) {
      setServerError('6자리 인증 코드를 입력해주세요')
      return
    }

    setIsVerifying(true)
    setServerError('')
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      email: signupEmail,
      token: otpCode,
      type: 'signup',
    })

    if (error) {
      setServerError('인증 코드가 올바르지 않습니다. 다시 확인해주세요')
      setIsVerifying(false)
      return
    }

    router.push(ROUTES.HOME)
  }

  async function handleResendCode() {
    setServerError('')
    const supabase = createClient()

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: signupEmail,
    })

    if (error) {
      setServerError('코드 재전송에 실패했습니다. 잠시 후 다시 시도해주세요')
      return
    }

    setServerError('')
    setOtpCode('')
  }

  if (step === 'verify') {
    return (
      <div className="w-full">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4]">
            <Mail size={28} className="text-success" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-text-primary">
            이메일 인증
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            <span className="font-semibold text-text-primary">{signupEmail}</span>
            <br />
            으로 전송된 6자리 인증 코드를 입력하세요
          </p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg border border-error/20 bg-[#FEF2F2] px-4 py-3 text-sm text-error">
            {serverError}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="인증 코드"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            rightIcon={<ShieldCheck size={16} className="text-text-tertiary" />}
          />

          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isVerifying}
            onClick={handleVerifyOtp}
          >
            인증 확인
          </Button>

          <p className="text-center text-sm text-text-secondary">
            코드를 못 받으셨나요?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              className="font-semibold text-text-primary hover:underline"
            >
              다시 보내기
            </button>
          </p>
        </div>
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
        {...register('email', {
          onBlur: (e) => checkDuplicate('email', e.target.value),
        })}
      />

      <Input
        label="유저명"
        type="text"
        autoComplete="username"
        placeholder="유저명을 입력하세요"
        hint="한글, 영문, 숫자, _ 사용 가능"
        error={errors.username?.message}
        {...register('username', {
          onBlur: (e) => checkDuplicate('username', e.target.value),
        })}
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
        error={
          errors.confirmPassword?.message ??
          (confirmPassword && password !== confirmPassword
            ? '비밀번호가 일치하지 않습니다'
            : undefined)
        }
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
