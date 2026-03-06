import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const { data: skill } = await supabase
    .from('skills')
    .select('id, file_url')
    .eq('id', skillId)
    .eq('status', 'approved')
    .single()

  if (!skill) {
    return NextResponse.json(
      { data: null, error: '스킬을 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  const { data, error } = await supabase
    .from('downloads')
    .insert({
      skill_id: skillId,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { data: null, error: '다운로드 기록에 실패했습니다' },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { data: { ...data, file_url: skill.file_url }, error: null },
    { status: 201 }
  )
}
