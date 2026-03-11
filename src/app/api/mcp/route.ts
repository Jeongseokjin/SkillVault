import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const TOOLS = [
  {
    name: 'search_skills',
    description: 'SkillVault에서 AI 스킬을 검색합니다. 키워드로 제목, 설명, 태그를 매칭합니다.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: '검색 키워드',
        },
        category: {
          type: 'string',
          description: '카테고리 필터 (선택)',
        },
        limit: {
          type: 'number',
          description: '결과 수 (기본 5, 최대 20)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_skill_content',
    description: '특정 스킬의 전체 정보를 반환합니다. 제목, 설명, 카테고리, 태그, 작성자, npm 패키지 정보 등을 포함합니다.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        skillId: {
          type: 'string',
          description: '스킬 UUID',
        },
      },
      required: ['skillId'],
    },
  },
]

interface JsonRpcRequest {
  jsonrpc: string
  id: number | string
  method: string
  params?: Record<string, unknown>
}

function jsonRpcResponse(id: number | string | null, result: unknown) {
  return NextResponse.json(
    { jsonrpc: '2.0', id, result },
    { headers: CORS_HEADERS }
  )
}

function jsonRpcError(
  id: number | string | null,
  code: number,
  message: string
) {
  return NextResponse.json(
    { jsonrpc: '2.0', id, error: { code, message } },
    { headers: CORS_HEADERS }
  )
}

async function handleSearchSkills(args: Record<string, unknown>) {
  const query = args.query as string
  const category = args.category as string | undefined
  const limit = Math.min(Number(args.limit ?? 5), 20)

  let dbQuery = supabaseAdmin
    .from('skills')
    .select('id, title, description, category, tags, downloads, like_count, bookmark_count, version, npm_package_name, created_at, author:profiles!skills_author_id_fkey(username)')
    .eq('status', 'approved')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('like_count', { ascending: false })
    .limit(limit)

  if (category) {
    dbQuery = dbQuery.eq('category', category)
  }

  const { data, error } = await dbQuery

  if (error) {
    return { content: [{ type: 'text', text: `검색 오류: ${error.message}` }], isError: true }
  }

  if (!data || data.length === 0) {
    return { content: [{ type: 'text', text: `"${query}"에 대한 검색 결과가 없습니다.` }] }
  }

  const results = data.map((skill) => {
    const author = skill.author as unknown as { username: string } | null
    let text = `## ${skill.title}\n`
    text += `- 카테고리: ${skill.category}\n`
    text += `- 설명: ${skill.description ?? '없음'}\n`
    text += `- 태그: ${skill.tags?.join(', ') ?? '없음'}\n`
    text += `- 작성자: ${author?.username ?? '알 수 없음'}\n`
    text += `- 좋아요: ${skill.like_count} | 다운로드: ${skill.downloads} | 북마크: ${skill.bookmark_count}\n`
    text += `- 버전: ${skill.version}\n`
    if (skill.npm_package_name) {
      text += `- MCP 설치: \`npx ${skill.npm_package_name}\`\n`
    }
    text += `- ID: ${skill.id}\n`
    return text
  })

  return {
    content: [
      {
        type: 'text',
        text: `"${query}" 검색 결과 (${data.length}건):\n\n${results.join('\n---\n\n')}`,
      },
    ],
  }
}

async function handleGetSkillContent(args: Record<string, unknown>) {
  const skillId = args.skillId as string

  const { data, error } = await supabaseAdmin
    .from('skills')
    .select('*, author:profiles!skills_author_id_fkey(username, email)')
    .eq('id', skillId)
    .eq('status', 'approved')
    .single()

  if (error || !data) {
    return { content: [{ type: 'text', text: `스킬을 찾을 수 없습니다. (ID: ${skillId})` }], isError: true }
  }

  const author = data.author as unknown as { username: string; email: string } | null

  let text = `# ${data.title}\n\n`
  text += `## 기본 정보\n`
  text += `- ID: ${data.id}\n`
  text += `- 카테고리: ${data.category}\n`
  text += `- 버전: ${data.version}\n`
  text += `- 작성자: ${author?.username ?? '알 수 없음'}\n`
  text += `- 등록일: ${data.created_at}\n\n`
  text += `## 설명\n${data.description ?? '설명이 없습니다.'}\n\n`
  text += `## 태그\n${data.tags?.join(', ') ?? '없음'}\n\n`
  text += `## 통계\n`
  text += `- 좋아요: ${data.like_count}\n`
  text += `- 다운로드: ${data.downloads}\n`
  text += `- 북마크: ${data.bookmark_count}\n\n`

  if (data.npm_package_name) {
    text += `## MCP 패키지\n`
    text += `- 패키지명: ${data.npm_package_name}\n`
    text += `- 설치 명령어: \`npx ${data.npm_package_name}\`\n`
    text += `- 배포일: ${data.npm_published_at}\n\n`
  }

  if (data.file_url) {
    text += `## 파일\n- 다운로드: ${data.file_url}\n\n`
  }

  if (data.preview_url) {
    text += `## 미리보기\n- ${data.preview_url}\n`
  }

  return { content: [{ type: 'text', text }] }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  let body: JsonRpcRequest

  try {
    body = await request.json()
  } catch {
    return jsonRpcError(null, -32700, 'Parse error')
  }

  if (body.jsonrpc !== '2.0' || !body.method) {
    return jsonRpcError(body.id ?? null, -32600, 'Invalid Request')
  }

  const { id, method, params } = body

  switch (method) {
    case 'initialize':
      return jsonRpcResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'skillvault-mcp',
          version: '1.0.0',
        },
      })

    case 'notifications/initialized':
      return jsonRpcResponse(id, {})

    case 'tools/list':
      return jsonRpcResponse(id, { tools: TOOLS })

    case 'tools/call': {
      const toolName = (params as Record<string, unknown>)?.name as string
      const args = ((params as Record<string, unknown>)?.arguments ?? {}) as Record<string, unknown>

      if (toolName === 'search_skills') {
        const result = await handleSearchSkills(args)
        return jsonRpcResponse(id, result)
      }

      if (toolName === 'get_skill_content') {
        const result = await handleGetSkillContent(args)
        return jsonRpcResponse(id, result)
      }

      return jsonRpcError(id, -32601, `Unknown tool: ${toolName}`)
    }

    default:
      return jsonRpcError(id, -32601, `Method not found: ${method}`)
  }
}
