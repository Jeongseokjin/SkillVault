import { z } from 'zod'
import {
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
} from '@/constants'

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)/
const USERNAME_REGEX = /^[a-zA-Z0-9가-힣_]+$/

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일을 입력해주세요'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다`),
})

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, '이메일을 입력해주세요')
      .email('올바른 이메일을 입력해주세요'),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `영문과 숫자를 포함해 ${MIN_PASSWORD_LENGTH}자 이상 입력해주세요`)
      .regex(PASSWORD_REGEX, '영문과 숫자를 포함해 8자 이상 입력해주세요'),
    confirmPassword: z
      .string()
      .min(1, '비밀번호 확인을 입력해주세요'),
    username: z
      .string()
      .min(MIN_USERNAME_LENGTH, `유저명은 ${MIN_USERNAME_LENGTH}자 이상이어야 합니다`)
      .max(MAX_USERNAME_LENGTH, `유저명은 ${MAX_USERNAME_LENGTH}자 이하여야 합니다`)
      .regex(USERNAME_REGEX, '한글, 영문, 숫자, _만 사용 가능합니다'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })

export type LoginSchema = z.infer<typeof loginSchema>
export type SignupSchema = z.infer<typeof signupSchema>
