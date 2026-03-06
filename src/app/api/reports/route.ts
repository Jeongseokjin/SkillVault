import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reportSchema } from '@/lib/validations/skill'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
    return NextResponse.json(
      { data: null, error: '관리자 권한이 필요합니다' },
      { status: 403 }
    )
  }

  const { data, error } = await supabase
    .from('reports')
    .select(
      '*, skill:skills!reports_skill_id_fkey(id, title), reporter:profiles!reports_reporter_id_fkey(id, username, email)'
    )
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { data: null, error: '신고 목록을 불러오는데 실패했습니다' },
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
  const parsed = reportSchema.safeParse(body)

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
    .from('reports')
    .select('id')
    .eq('skill_id', skillId)
    .eq('reporter_id', user.id)
    .eq('status', 'pending')
    .single()

  if (existing) {
    return NextResponse.json(
      { data: null, error: '이미 신고한 스킬입니다' },
      { status: 409 }
    )
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      skill_id: skillId,
      reporter_id: user.id,
      reason: parsed.data.reason,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { data: null, error: '신고 접수에 실패했습니다' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data, error: null }, { status: 201 })
}
