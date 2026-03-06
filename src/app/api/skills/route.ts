import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ITEMS_PER_PAGE } from '@/constants'
import type { Category, SortOption } from '@/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = request.nextUrl

  const category = searchParams.get('category') as Category | '전체' | null
  const sort = (searchParams.get('sort') ?? 'latest') as SortOption
  const search = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const limit = Number(searchParams.get('limit') ?? String(ITEMS_PER_PAGE))

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('skills')
    .select('*, author:profiles!skills_author_id_fkey(*)', { count: 'exact' })
    .eq('status', 'approved')

  if (category && category !== '전체') {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (sort === 'popular') {
    query = query.order('downloads', { ascending: false })
  } else if (sort === 'rating') {
    query = query.order('rating', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, count, error } = await query.range(from, to)

  if (error) {
    return NextResponse.json(
      { data: null, error: '스킬 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }

  const total = count ?? 0

  return NextResponse.json({
    data: {
      data: data ?? [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    error: null,
  })
}
