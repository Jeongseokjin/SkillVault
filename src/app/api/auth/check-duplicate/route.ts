import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, username } = await request.json()

    // 이메일 중복 체크 (auth.users에서 admin API로 확인)
    if (email) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })

      if (error) {
        console.error('listUsers error:', error)
        return NextResponse.json(
          { error: '이메일 확인 중 오류가 발생했습니다' },
          { status: 500 }
        )
      }

      const exists = data?.users?.some(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      )

      if (exists) {
        return NextResponse.json(
          { field: 'email', error: '이미 가입된 이메일입니다' },
          { status: 409 }
        )
      }
    }

    // 유저명 중복 체크 (profiles 테이블)
    if (username) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .maybeSingle()

      if (error) {
        console.error('username check error:', error)
        return NextResponse.json(
          { error: '유저명 확인 중 오류가 발생했습니다' },
          { status: 500 }
        )
      }

      if (data) {
        return NextResponse.json(
          { field: 'username', error: '이미 사용 중인 유저명입니다' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('check-duplicate error:', err)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
