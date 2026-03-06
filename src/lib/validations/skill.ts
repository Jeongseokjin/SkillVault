import { z } from 'zod'
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_TAGS_COUNT,
  MAX_TAG_LENGTH,
  MAX_COMMENT_LENGTH,
  REPORT_REASONS,
} from '@/constants'

export const skillUploadSchema = z.object({
  title: z
    .string()
    .min(2, '제목은 2자 이상이어야 합니다')
    .max(MAX_TITLE_LENGTH, `제목은 ${MAX_TITLE_LENGTH}자 이하여야 합니다`),
  description: z
    .string()
    .min(1, '설명을 입력해주세요')
    .max(MAX_DESCRIPTION_LENGTH, `설명은 ${MAX_DESCRIPTION_LENGTH}자 이하여야 합니다`),
  category: z.enum(['디자인/UI', '개발', '마케팅', '기타'], {
    errorMap: () => ({ message: '카테고리를 선택해주세요' }),
  }),
  tags: z
    .array(
      z.string().max(MAX_TAG_LENGTH, `태그는 ${MAX_TAG_LENGTH}자 이하여야 합니다`)
    )
    .max(MAX_TAGS_COUNT, `태그는 최대 ${MAX_TAGS_COUNT}개까지 추가 가능합니다`),
  price: z.enum(['free', 'premium'], {
    errorMap: () => ({ message: '가격 유형을 선택해주세요' }),
  }),
})

export const reviewSchema = z.object({
  rating: z
    .number()
    .int('별점은 정수여야 합니다')
    .min(1, '별점은 1점 이상이어야 합니다')
    .max(5, '별점은 5점 이하여야 합니다'),
  comment: z
    .string()
    .max(MAX_COMMENT_LENGTH, `리뷰는 ${MAX_COMMENT_LENGTH}자 이하여야 합니다`),
})

export const reportSchema = z.object({
  reason: z.enum(REPORT_REASONS, {
    errorMap: () => ({ message: '신고 사유를 선택해주세요' }),
  }),
})

export type SkillUploadSchema = z.infer<typeof skillUploadSchema>
export type ReviewSchema = z.infer<typeof reviewSchema>
export type ReportSchema = z.infer<typeof reportSchema>
