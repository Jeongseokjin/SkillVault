'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Upload, ImagePlus, X, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { skillUploadSchema, type SkillUploadSchema } from '@/lib/validations/skill'
import { Input, Textarea, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  CATEGORIES,
  ROUTES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MAX_PREVIEW_SIZE_BYTES,
  MAX_PREVIEW_SIZE_MB,
  MAX_TAGS_COUNT,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  ALLOWED_FILE_TYPES,
  ALLOWED_IMAGE_TYPES,
} from '@/constants'
import type { Category, SkillPrice } from '@/types'

const UPLOAD_CATEGORIES = CATEGORIES.filter(
  (category) => category.value !== '전체'
)

interface SkillUploadFormProps {
  userId: string
}

export default function SkillUploadForm({ userId }: SkillUploadFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [skillFile, setSkillFile] = useState<File | null>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SkillUploadSchema>({
    resolver: zodResolver(skillUploadSchema),
    defaultValues: {
      price: 'free',
      tags: [],
    },
  })

  const titleValue = watch('title') ?? ''
  const descriptionValue = watch('description') ?? ''
  const selectedCategory = watch('category')
  const selectedPrice = watch('price')

  const onSkillDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`파일 크기가 ${MAX_FILE_SIZE_MB}MB를 초과합니다`)
      return
    }

    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!ALLOWED_FILE_TYPES.includes(extension)) {
      toast.error(`허용된 파일 형식: ${ALLOWED_FILE_TYPES.join(', ')}`)
      return
    }

    setSkillFile(file)
  }, [])

  const onPreviewDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (file.size > MAX_PREVIEW_SIZE_BYTES) {
      toast.error(`이미지 크기가 ${MAX_PREVIEW_SIZE_MB}MB를 초과합니다`)
      return
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('허용된 이미지 형식: JPEG, PNG, WebP')
      return
    }

    setPreviewFile(file)
  }, [])

  const skillDropzone = useDropzone({
    onDrop: onSkillDrop,
    multiple: false,
    noClick: false,
  })

  const previewDropzone = useDropzone({
    onDrop: onPreviewDrop,
    multiple: false,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    noClick: false,
  })

  function handleTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()

    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (tags.includes(trimmed)) return

    if (tags.length >= MAX_TAGS_COUNT) {
      toast.error(`태그는 최대 ${MAX_TAGS_COUNT}개까지 추가 가능합니다`)
      return
    }

    const updated = [...tags, trimmed]
    setTags(updated)
    setValue('tags', updated)
    setTagInput('')
  }

  function removeTag(target: string) {
    const updated = tags.filter((tag) => tag !== target)
    setTags(updated)
    setValue('tags', updated)
  }

  async function uploadToStorage(file: File, bucket: string): Promise<string> {
    const extension = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${extension}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return urlData.publicUrl
  }

  async function onSubmit(formData: SkillUploadSchema) {
    setIsUploading(true)

    try {
      let fileUrl: string | null = null
      let previewUrl: string | null = null

      if (skillFile) {
        fileUrl = await uploadToStorage(skillFile, 'skills')
      }

      if (previewFile) {
        previewUrl = await uploadToStorage(previewFile, 'previews')
      }

      const { error } = await supabase.from('skills').insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        price: formData.price,
        author_id: userId,
        file_url: fileUrl,
        preview_url: previewUrl,
        status: 'pending',
        version: '1.0.0',
      })

      if (error) {
        toast.error('업로드에 실패했습니다. 잠시 후 다시 시도해주세요')
        return
      }

      toast.success('업로드 완료! 검토 후 승인됩니다')
      router.push(ROUTES.MYPAGE)
    } catch {
      toast.error('파일 업로드 중 오류가 발생했습니다')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          label="제목"
          placeholder="스킬 이름을 입력하세요"
          error={errors.title?.message}
          {...register('title')}
        />
        <p className="mt-1 text-right text-xs text-text-tertiary">
          {titleValue.length}/{MAX_TITLE_LENGTH}
        </p>
      </div>

      <div>
        <Textarea
          label="설명"
          placeholder="스킬에 대한 상세 설명을 입력하세요"
          rows={5}
          error={errors.description?.message}
          {...register('description')}
        />
        <p className="mt-1 text-right text-xs text-text-tertiary">
          {descriptionValue.length}/{MAX_DESCRIPTION_LENGTH}
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-text-primary">카테고리</p>
        <div className="flex flex-wrap gap-2">
          {UPLOAD_CATEGORIES.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => setValue('category', category.value as Category)}
              className={cn(
                'rounded-lg border-[1.5px] px-4 py-2.5 text-sm font-medium transition-all duration-150',
                selectedCategory === category.value
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-surface text-text-secondary hover:border-text-tertiary'
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="mt-1 text-xs text-error">{errors.category.message}</p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-text-primary">가격</p>
        <div className="flex gap-3">
          {(['free', 'premium'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setValue('price', option as SkillPrice)}
              className={cn(
                'flex-1 rounded-lg border-[1.5px] px-4 py-3 text-sm font-medium transition-all duration-150',
                selectedPrice === option
                  ? option === 'free'
                    ? 'border-success bg-[#F0FDF4] text-success'
                    : 'border-premium bg-[#F5F3FF] text-premium'
                  : 'border-border bg-surface text-text-secondary'
              )}
            >
              {option === 'free' ? '무료' : '프리미엄'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-text-primary">
          태그 ({tags.length}/{MAX_TAGS_COUNT})
        </p>
        <div className="flex flex-wrap items-center gap-2 rounded-[10px] border-[1.5px] border-border px-4 py-3 focus-within:border-accent">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-md bg-[#F5F5F5] px-2 py-1 text-xs font-medium text-text-secondary"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={tags.length >= MAX_TAGS_COUNT ? '' : '태그 입력 후 Enter'}
            disabled={tags.length >= MAX_TAGS_COUNT}
            className="min-w-[120px] flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed"
          />
        </div>
        {errors.tags && (
          <p className="mt-1 text-xs text-error">{errors.tags.message}</p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-text-primary">스킬 파일</p>
        <div
          {...skillDropzone.getRootProps()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed py-8 transition-colors duration-150',
            skillDropzone.isDragActive
              ? 'border-accent bg-[#F5F5F5]'
              : 'border-border hover:border-text-tertiary'
          )}
        >
          <input {...skillDropzone.getInputProps()} />
          {skillFile ? (
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">
                {skillFile.name}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setSkillFile(null)
                }}
                className="text-text-tertiary hover:text-error"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={24} className="mb-2 text-text-tertiary" />
              <p className="text-sm text-text-tertiary">
                파일을 드래그하거나 클릭하세요
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                {ALLOWED_FILE_TYPES.join(', ')} (최대 {MAX_FILE_SIZE_MB}MB)
              </p>
            </>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-text-primary">미리보기 이미지</p>
        <div
          {...previewDropzone.getRootProps()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed py-8 transition-colors duration-150',
            previewDropzone.isDragActive
              ? 'border-accent bg-[#F5F5F5]'
              : 'border-border hover:border-text-tertiary'
          )}
        >
          <input {...previewDropzone.getInputProps()} />
          {previewFile ? (
            <div className="flex items-center gap-2">
              <ImagePlus size={16} className="text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">
                {previewFile.name}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setPreviewFile(null)
                }}
                className="text-text-tertiary hover:text-error"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <ImagePlus size={24} className="mb-2 text-text-tertiary" />
              <p className="text-sm text-text-tertiary">
                미리보기 이미지를 선택하세요
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                JPEG, PNG, WebP (최대 {MAX_PREVIEW_SIZE_MB}MB)
              </p>
            </>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isUploading}
      >
        스킬 등록하기
      </Button>
    </form>
  )
}
