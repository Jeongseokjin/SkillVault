import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reviewSchema } from '@/lib/validations/skill'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const skillId = request.nextUrl.searchParams.get('skill_id')

  if (!skillId) {
    return NextResponse.json(
      { data: null, error: 'skill_id가 필요합니다' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:profiles!reviews_user_id_fkey(*)')
    .eq('skill_id', skillId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { data: null, error: '리뷰를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: data ?? [], error: null })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { data: null, error: '인증이 필요합니다' },
      { status: 401 }
    )
  }

  const body = await request.json()
  const parsed = reviewSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const skillId = body.skill_id as string | undefined

  if (!skillId) {
    return NextResponse.json(
      { data: null, error: 'skill_id가 필요합니다' },
      { status: 400 }
    )
  }

  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('skill_id', skillId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json(
      { data: null, error: '이미 리뷰를 작성했습니다' },
      { status: 409 }
    )
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      skill_id: skillId,
      user_id: user.id,
      comment: parsed.data.comment,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { data: null, error: '리뷰 작성에 실패했습니다' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data, error: null }, { status: 201 })
}
