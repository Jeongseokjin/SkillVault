'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ITEMS_PER_PAGE } from '@/constants'
import type { SkillWithAuthor, SkillFilterValues, PaginatedResponse } from '@/types'

async function fetchSkills(
  filters: SkillFilterValues
): Promise<PaginatedResponse<SkillWithAuthor>> {
  const supabase = createClient()
  const from = (filters.page - 1) * filters.limit
  const to = from + filters.limit - 1

  let query = supabase
    .from('skills')
    .select('*, author:profiles!skills_author_id_fkey(*)', { count: 'exact' })
    .eq('status', 'approved')

  if (filters.category !== '전체') {
    query = query.eq('category', filters.category)
  }

  if (filters.search.trim()) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    )
  }

  switch (filters.sort) {
    case 'popular':
      query = query.order('downloads', { ascending: false })
      break
    case 'likes':
      query = query.order('like_count', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw new Error('스킬 목록을 불러오는데 실패했습니다')
  }

  const total = count ?? 0

  return {
    data: (data ?? []) as SkillWithAuthor[],
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  }
}

export function useSkills(filters: SkillFilterValues) {
  return useQuery({
    queryKey: ['skills', filters],
    queryFn: () => fetchSkills(filters),
  })
}

export function useSkillsWithDefaults(
  overrides: Partial<SkillFilterValues> = {}
) {
  const filters: SkillFilterValues = {
    category: '전체',
    sort: 'latest',
    search: '',
    page: 1,
    limit: ITEMS_PER_PAGE,
    ...overrides,
  }

  return useSkills(filters)
}
