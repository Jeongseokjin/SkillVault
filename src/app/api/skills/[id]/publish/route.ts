import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeFile, mkdir, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { execSync } from 'child_process'

interface RouteParams {
  params: Promise<{ id: string }>
}

function slugify(id: string): string {
  return id.slice(0, 8)
}

function generatePackageJson(packageName: string, description: string, version: string) {
  return JSON.stringify(
    {
      name: packageName,
      version,
      description,
      type: 'module',
      bin: { [packageName.split('/')[1]]: './index.js' },
      dependencies: {
        '@modelcontextprotocol/sdk': '^1.0.0',
      },
      license: 'MIT',
      keywords: ['mcp', 'skillvault', 'ai-skill'],
    },
    null,
    2
  )
}

function generateMcpServer(
  title: string,
  description: string,
  category: string,
  tags: string[]
) {
  const toolName = 'run_skill'

  return `#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: ${JSON.stringify(title)}, version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const SKILL_CONTENT = ${JSON.stringify(description)};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: ${JSON.stringify(toolName)},
      description: ${JSON.stringify(`[${category}] ${title} - ${tags.join(', ')}`)},
      inputSchema: {
        type: 'object',
        properties: {
          input: {
            type: 'string',
            description: '스킬에 전달할 입력값 (선택)',
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === ${JSON.stringify(toolName)}) {
    const userInput = request.params.arguments?.input ?? '';
    return {
      content: [
        {
          type: 'text',
          text: userInput
            ? SKILL_CONTENT + '\\n\\n--- User Input ---\\n' + userInput
            : SKILL_CONTENT,
        },
      ],
    };
  }

  return {
    content: [{ type: 'text', text: 'Unknown tool' }],
    isError: true,
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
`
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

  if (skill.author_id !== user.id) {
    return NextResponse.json(
      { data: null, error: '본인의 스킬만 배포할 수 있습니다' },
      { status: 403 }
    )
  }

  if (skill.status !== 'approved') {
    return NextResponse.json(
      { data: null, error: '승인된 스킬만 배포할 수 있습니다' },
      { status: 400 }
    )
  }

  const slug = slugify(id)
  const packageName = `@skillvault/mcp-${slug}`
  const version = skill.version ?? '1.0.0'

  const tempDir = join(tmpdir(), `skillvault-mcp-${slug}-${Date.now()}`)

  try {
    await mkdir(tempDir, { recursive: true })

    const packageJson = generatePackageJson(
      packageName,
      skill.description ?? skill.title,
      version
    )
    const serverCode = generateMcpServer(
      skill.title,
      skill.description ?? '',
      skill.category,
      skill.tags ?? []
    )
    const npmrc = `//registry.npmjs.org/:_authToken=${npmToken}\n`

    await Promise.all([
      writeFile(join(tempDir, 'package.json'), packageJson),
      writeFile(join(tempDir, 'index.js'), serverCode),
      writeFile(join(tempDir, '.npmrc'), npmrc),
    ])

    execSync('npm publish --access public', {
      cwd: tempDir,
      timeout: 30000,
      stdio: 'pipe',
    })

    await supabase
      .from('skills')
      .update({
        npm_package_name: packageName,
        npm_published_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({
      data: {
        packageName,
        installCommand: `npx ${packageName}`,
      },
      error: null,
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : '배포 중 오류가 발생했습니다'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {})
  }
}
