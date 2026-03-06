import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()

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
    return NextResponse.json(
      { data: null, error: '스킬을 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    data: {
      skill: skillResult.data,
      reviews: reviewsResult.data ?? [],
    },
    error: null,
  })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
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

  const { data: skill } = await supabase
    .from('skills')
    .select('author_id')
    .eq('id', id)
    .single()

  if (!skill) {
    return NextResponse.json(
      { data: null, error: '스킬을 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  if (skill.author_id !== user.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      return NextResponse.json(
        { data: null, error: '권한이 없습니다' },
        { status: 403 }
      )
    }
  }

  const { data, error } = await supabase
    .from('skills')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { data: null, error: '수정에 실패했습니다' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data, error: null })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
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

  const { data: skill } = await supabase
    .from('skills')
    .select('author_id')
    .eq('id', id)
    .single()

  if (!skill) {
    return NextResponse.json(
      { data: null, error: '스킬을 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  if (skill.author_id !== user.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
      return NextResponse.json(
        { data: null, error: '권한이 없습니다' },
        { status: 403 }
      )
    }
  }

  const { error } = await supabase.from('skills').delete().eq('id', id)

  if (error) {
    return NextResponse.json(
      { data: null, error: '삭제에 실패했습니다' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: { id }, error: null })
}
