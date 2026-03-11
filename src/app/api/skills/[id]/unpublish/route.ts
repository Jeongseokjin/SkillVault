import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

async function unpublishFromNpm(
  packageName: string,
  version: string,
  npmToken: string
): Promise<void> {
  const encodedName = packageName.replace('/', '%2f')
  const url = `https://registry.npmjs.org/${encodedName}/-/${packageName.replace('/', '-').replace('@', '')}-${version}.tgz/-rev/1`

  // npm unpublish: DELETE the specific version
  const res = await fetch(
    `https://registry.npmjs.org/${encodedName}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${npmToken}`,
      },
    }
  )

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`npm 배포 취소 실패 (${res.status}): ${errorText}`)
  }
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const npmToken = process.env.NPM_TOKEN

  if (!npmToken) {
    return NextResponse.json(
      { data: null, error: 'NPM 토큰이 설정되지 않았습니다' },
      { status: 500 }
    )
  }

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
    .select('*')
    .eq('id', id)
    .single()

  if (!skill) {
    return NextResponse.json(
      { data: null, error: '스킬을 찾을 수 없습니다' },
      { status: 404 }
    )
  }

  if (!skill.npm_package_name) {
    return NextResponse.json(
      { data: null, error: 'npm에 배포되지 않은 스킬입니다' },
      { status: 400 }
    )
  }

  try {
    await unpublishFromNpm(
      skill.npm_package_name,
      skill.version ?? '1.0.0',
      npmToken
    )

    await supabase
      .from('skills')
      .update({
        npm_package_name: null,
        npm_published_at: null,
      })
      .eq('id', id)

    return NextResponse.json({
      data: { message: 'npm 배포가 취소되었습니다' },
      error: null,
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : '배포 취소 중 오류가 발생했습니다'
    console.error('[unpublish] error:', err)
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
