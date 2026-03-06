import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, skill:skills!bookmarks_skill_id_fkey(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { data: null, error: '즐겨찾기를 불러오는데 실패했습니다' },
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
  const skillId = body.skill_id as string | undefined

  if (!skillId) {
    return NextResponse.json(
      { data: null, error: 'skill_id가 필요합니다' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      skill_id: skillId,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { data: null, error: '이미 즐겨찾기에 추가되었습니다' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { data: null, error: '즐겨찾기 추가에 실패했습니다' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data, error: null }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
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

  const skillId = request.nextUrl.searchParams.get('skill_id')

  if (!skillId) {
    return NextResponse.json(
      { data: null, error: 'skill_id가 필요합니다' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('skill_id', skillId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json(
      { data: null, error: '즐겨찾기 해제에 실패했습니다' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: { skill_id: skillId }, error: null })
}
