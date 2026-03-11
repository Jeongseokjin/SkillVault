import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'
import { gzipSync } from 'zlib'

interface RouteParams {
  params: Promise<{ id: string }>
}

function slugify(id: string): string {
  return id.slice(0, 8)
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

// tar 헤더 생성 (512바이트)
function createTarHeader(fileName: string, content: Buffer): Buffer {
  const header = Buffer.alloc(512)

  // filename (0-99)
  header.write(fileName, 0, 100, 'utf8')
  // mode (100-107)
  header.write('0000644\0', 100, 8, 'utf8')
  // uid (108-115)
  header.write('0000000\0', 108, 8, 'utf8')
  // gid (116-123)
  header.write('0000000\0', 116, 8, 'utf8')
  // size (124-135) - octal
  header.write(content.length.toString(8).padStart(11, '0') + '\0', 124, 12, 'utf8')
  // mtime (136-147)
  header.write(Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + '\0', 136, 12, 'utf8')
  // checksum placeholder (148-155) - spaces
  header.write('        ', 148, 8, 'utf8')
  // type flag (156) - '0' for regular file
  header.write('0', 156, 1, 'utf8')
  // ustar magic (257-262)
  header.write('ustar\0', 257, 6, 'utf8')
  // ustar version (263-264)
  header.write('00', 263, 2, 'utf8')

  // checksum 계산
  let checksum = 0
  for (let i = 0; i < 512; i++) {
    checksum += header[i]
  }
  header.write(checksum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'utf8')

  return header
}

// tar.gz 생성 (메모리)
function createTarball(files: { name: string; content: string }[]): Buffer {
  const blocks: Buffer[] = []

  for (const file of files) {
    const content = Buffer.from(file.content, 'utf8')
    const header = createTarHeader(`package/${file.name}`, content)
    blocks.push(header)
    blocks.push(content)

    // 512바이트 경계로 패딩
    const remainder = content.length % 512
    if (remainder > 0) {
      blocks.push(Buffer.alloc(512 - remainder))
    }
  }

  // 종료 블록 (1024바이트 null)
  blocks.push(Buffer.alloc(1024))

  const tar = Buffer.concat(blocks)
  return gzipSync(tar)
}

// npm 레지스트리 HTTP API로 배포
async function publishToNpm(
  packageName: string,
  version: string,
  description: string,
  tarball: Buffer,
  npmToken: string
): Promise<void> {
  const shasum = createHash('sha1').update(tarball).digest('hex')
  const integrity = 'sha512-' + createHash('sha512').update(tarball).digest('base64')
  const tarballName = `${packageName.replace('/', '-').replace('@', '')}-${version}.tgz`

  const packageJson = {
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
  }

  const body = {
    _id: packageName,
    name: packageName,
    description,
    access: 'public',
    'dist-tags': { latest: version },
    versions: {
      [version]: {
        ...packageJson,
        dist: {
          tarball: `https://registry.npmjs.org/${packageName}/-/${tarballName}`,
          shasum,
          integrity,
        },
      },
    },
    _attachments: {
      [tarballName]: {
        content_type: 'application/octet-stream',
        data: tarball.toString('base64'),
        length: tarball.length,
      },
    },
  }

  const encodedName = packageName.replace('/', '%2f')
  const res = await fetch(`https://registry.npmjs.org/${encodedName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${npmToken}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`npm 배포 실패 (${res.status}): ${errorText}`)
  }
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const npmToken = process.env.NPM_TOKEN

  console.log('[publish] NPM_TOKEN exists:', !!npmToken, 'length:', npmToken?.length ?? 0)

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

  if (skill.status !== 'approved') {
    return NextResponse.json(
      { data: null, error: '승인된 스킬만 배포할 수 있습니다' },
      { status: 400 }
    )
  }

  const slug = slugify(id)
  const packageName = `@skillvault/mcp-${slug}`
  const version = skill.version ?? '1.0.0'

  try {
    const serverCode = generateMcpServer(
      skill.title,
      skill.description ?? '',
      skill.category,
      skill.tags ?? []
    )

    const packageJsonContent = JSON.stringify(
      {
        name: packageName,
        version,
        description: skill.description ?? skill.title,
        type: 'module',
        bin: { [`mcp-${slug}`]: './index.js' },
        dependencies: {
          '@modelcontextprotocol/sdk': '^1.0.0',
        },
        license: 'MIT',
        keywords: ['mcp', 'skillvault', 'ai-skill'],
      },
      null,
      2
    )

    const tarball = createTarball([
      { name: 'package.json', content: packageJsonContent },
      { name: 'index.js', content: serverCode },
    ])

    await publishToNpm(
      packageName,
      version,
      skill.description ?? skill.title,
      tarball,
      npmToken
    )

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
    console.error('[publish] packageName:', packageName, 'version:', version)
    console.error('[publish] error:', err)
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
