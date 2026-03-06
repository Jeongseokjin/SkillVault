'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { reportSchema, type ReportSchema } from '@/lib/validations/skill'
import { Modal, Button } from '@/components/ui'
import { REPORT_REASONS } from '@/constants'
import { cn } from '@/lib/utils'

interface SkillReportModalProps {
  isOpen: boolean
  onClose: () => void
  skillId: string
  userId: string
}

export default function SkillReportModal({
  isOpen,
  onClose,
  skillId,
  userId,
}: SkillReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportSchema>({
    resolver: zodResolver(reportSchema),
  })

  const selectedReason = watch('reason')

  async function onSubmit(formData: ReportSchema) {
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from('reports').insert({
        skill_id: skillId,
        reporter_id: userId,
        reason: formData.reason,
        status: 'pending',
      })

      if (error) {
        toast.error('신고 접수에 실패했습니다')
        return
      }

      toast.success('신고가 접수되었습니다')
      reset()
      onClose()
    } catch {
      toast.error('오류가 발생했습니다. 잠시 후 다시 시도해주세요')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="스킬 신고">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-text-secondary">
          신고 사유를 선택해주세요
        </p>
        <div className="space-y-2">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setValue('reason', reason, { shouldValidate: true })}
              className={cn(
                'w-full rounded-lg border-[1.5px] px-4 py-3 text-left text-sm font-medium transition-all duration-150',
                selectedReason === reason
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-surface text-text-secondary hover:border-text-tertiary'
              )}
            >
              {reason}
            </button>
          ))}
        </div>
        {errors.reason && (
          <p className="text-xs text-error">{errors.reason.message}</p>
        )}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="md"
            fullWidth
            isLoading={isSubmitting}
          >
            신고하기
          </Button>
        </div>
      </form>
    </Modal>
  )
}
