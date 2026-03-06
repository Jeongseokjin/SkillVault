'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { SkillWithAuthor, Review } from '@/types'

interface SkillDetailData {
  skill: SkillWithAuthor
  reviews: Review[]
}

async function fetchSkillDetail(id: string): Promise<SkillDetailData> {
  const supabase = createClient()

  const [skillResult, reviewsResult] = await Promise.all([
    supabase
      .from('skills')
      .select('*, author:profiles!skills_author_id_fkey(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('reviews')
      .select('*, user:profiles!reviews_user_id_fkey(*)')
      .eq('skill_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (skillResult.error) {
    throw new Error('스킬 정보를 불러오는데 실패했습니다')
  }

  return {
    skill: skillResult.data as SkillWithAuthor,
    reviews: (reviewsResult.data ?? []) as Review[],
  }
}

export function useSkillDetail(id: string) {
  return useQuery({
    queryKey: ['skill', id],
    queryFn: () => fetchSkillDetail(id),
    enabled: Boolean(id),
  })
}
