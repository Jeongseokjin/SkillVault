<div align="center">

# 🔐 SkillVault

**팀 내부 AI 스킬 허브 — Claude Code가 자동으로 팀 지식을 검색하고 활용합니다**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB_&_Storage-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel)](https://skill-vault-sage.vercel.app)

[🌐 데모 사이트](https://skill-vault-sage.vercel.app) · [📤 스킬 등록하기](https://skill-vault-sage.vercel.app/skills/upload) · [🤖 MCP 연동 가이드](#-mcp-연동)

</div>

---

## 💡 SkillVault란?

팀에서 만든 스킬, 가이드, 노하우를 한곳에 모아두고, **Claude Code가 MCP를 통해 자동으로 검색하고 활용**할 수 있게 만든 사내 AI 스킬 허브입니다.

Slack에 흩어진 스킬, Notion에 묻힌 가이드, GitHub에 올려놓고 잊힌 노하우 — 이제 SkillVault 하나로 모으고, Claude Code가 알아서 찾아씁니다.

### Before vs After

| | Before | After |
|---|---|---|
| 스킬 검색 | Slack 뒤지기, Notion 찾기 (~5분) | 웹 검색 또는 Claude Code 자동 검색 (~30초) |
| 스킬 사용 | 파일 다운로드 → 수동 설치 | MCP로 설치 없이 바로 활용 |
| 신규 입사자 | 반복 질문, 선배에게 의존 | SkillVault 링크 하나로 온보딩 |
| 스킬 공유 | 만든 사람만 사용 | 팀 전체가 검색하고 사용 |

---

## 📖 사용 방법

### 1. 회원가입 & 로그인

1. [SkillVault](https://skill-vault-sage.vercel.app)에 접속
2. 이메일 / 유저명 / 비밀번호로 회원가입
3. 이메일로 발송된 6자리 인증코드 입력
4. 인증 완료 후 바로 로그인

### 2. 스킬 검색 & 활용

[탐색 페이지](https://skill-vault-sage.vercel.app)에서 팀이 등록한 스킬을 찾을 수 있습니다.

- **키워드 검색** — 제목, 설명에서 키워드 매칭
- **카테고리 필터** — 개발 / 디자인 / 마케팅 / 업무
- **태그 필터** — 기술명, 도구명으로 세부 필터링
- **정렬** — 최신순, 인기순, 다운로드순

스킬 상세 페이지에서 파일 다운로드, 좋아요, 북마크, 리뷰를 남길 수 있습니다.

### 3. 스킬 등록하기

팀에 공유하고 싶은 지식이 있다면 누구나 등록할 수 있습니다.

**Step 1: `.md` 파일 작성**

```markdown
# 사내 DB 스키마 가이드

## users 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| email | text | 이메일 |
| name | text | 이름 |

## 자주 쓰는 쿼리
SELECT * FROM users WHERE email = '...';
```

> 이 파일이 Claude Code가 실제로 읽고 답변하는 핵심 콘텐츠입니다.
> 구체적인 정보, 실제 값, 예시 코드를 포함할수록 좋습니다.

**Step 2: [업로드 페이지](https://skill-vault-sage.vercel.app/skills/upload)에서 등록**

| 필드 | 작성법 |
|------|--------|
| 제목 | 스킬이 뭘 하는지 한눈에. 예: `사내 DB 스키마 레퍼런스` |
| 설명 | **MCP 검색 키워드를 많이 포함**. 예: `PostgreSQL users orders 테이블 구조, SQL 쿼리 모음` |
| 카테고리 | 개발 / 디자인 / 마케팅 / 업무 중 택1 |
| 태그 | 최대 5개. 구체적 기술명 위주. 예: `postgresql`, `sql`, `schema` |
| 스킬 파일 | `.md` `.txt` `.json` `.yaml` `.yml` (최대 10MB, 권장 50KB 이하) |
| 미리보기 이미지 | 선택사항. JPEG, PNG, WebP (최대 2MB) |

**Step 3: 관리자 승인 대기**

등록 후 `pending` → 관리자가 `approved`로 변경하면 검색에 노출됩니다.

### 4. 스킬 수정 & 삭제

- **수정** — 스킬 상세 페이지 → 편집 버튼 → 수정 후 저장 (재승인 필요)
- **삭제** — 스킬 상세 페이지 → 삭제 버튼 (복구 불가, 팀 채널 공지 권장)

---

## 🤖 MCP 연동

SkillVault의 핵심 기능입니다. Claude Code가 팀 스킬을 **자동으로 검색하고 파일 내용까지 읽어서 답변**합니다.

### 설정 방법

프로젝트 루트 또는 `~/.claude/` 디렉토리에 `.mcp.json` 파일 생성:

```json
{
  "mcpServers": {
    "skillvault": {
      "type": "http",
      "url": "https://skill-vault-sage.vercel.app/api/mcp"
    }
  }
}
```

### 동작 원리

```
👤 "사내 DB 스키마 알려줘"

🤖 Claude Code 내부:
   1. search_skills("database schema") 호출
   2. 매칭되는 스킬 발견
   3. get_skill_content로 .md 파일 내용 조회
   4. 파일 내용 기반으로 답변 생성

💬 "users 테이블은 다음과 같은 구조입니다: id (uuid), email (text), ..."
```

### MCP 도구

| 도구 | 설명 |
|------|------|
| `search_skills` | 키워드로 스킬 검색. query(필수), category(선택), limit(기본 5) |
| `get_skill_content` | 스킬 ID로 파일 내용까지 전체 조회 |

### API 테스트

```bash
# 도구 목록 확인
curl -s -X POST https://skill-vault-sage.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# 스킬 검색
curl -s -X POST https://skill-vault-sage.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_skills","arguments":{"query":"가이드","limit":5}}}'

# 스킬 상세 조회
curl -s -X POST https://skill-vault-sage.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_skill_content","arguments":{"skillId":"스킬UUID"}}}'
```

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 스킬 카탈로그 | 검색, 카테고리·태그 필터, 정렬, 페이지네이션 |
| 스킬 업로드 | 드래그앤드롭, 미리보기, 태그 관리 |
| MCP 서버 | Claude Code 자동 스킬 검색 & 파일 내용 반환 |
| 리뷰 시스템 | 별점 + 코멘트, 자동 평점 갱신 |
| 좋아요 / 북마크 | 낙관적 업데이트 (Optimistic Update) |
| 관리자 대시보드 | 스킬 승인/거절, 유저 관리/차단, 신고 관리 |
| 마이페이지 | 내 스킬, 즐겨찾기, 내 리뷰 |
| 인증 | 이메일 + OTP 인증, 미들웨어 라우트 보호 |
| 보안 | RLS, Zod 검증, 역할 기반 접근 제어 |

---

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript 5 (strict mode) |
| 스타일링 | Tailwind CSS 3 |
| DB / 인증 / 스토리지 | Supabase (PostgreSQL + Auth + Storage) |
| 상태 관리 | TanStack React Query 5 |
| 폼 / 검증 | React Hook Form + Zod |
| 애니메이션 | Framer Motion |
| 에러 모니터링 | Sentry |
| 테스트 | Jest + React Testing Library |
| CI/CD | GitHub Actions + Vercel |

---

## 🚀 로컬 개발 환경 설정

### 사전 준비
- Node.js 18+
- Supabase 프로젝트 ([무료 생성](https://supabase.com))

### 설치

```bash
# 1. 클론
git clone https://github.com/Jeongseokjin/SkillVault.git
cd SkillVault

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
```

`.env.local`에 아래 값 입력:

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (서버 전용) |
| `NEXT_PUBLIC_APP_URL` | 앱 URL (기본: `http://localhost:3000`) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN |
| `SENTRY_AUTH_TOKEN` | Sentry 인증 토큰 |

```bash
# 4. DB 스키마 적용
# Supabase SQL Editor에서 supabase/migrations/ 폴더의 SQL 파일을 순서대로 실행:
# 001_initial_schema.sql → 002_rls_policies.sql → ... → 006_storage.sql

# 5. 개발 서버 실행
npm run dev
```

`http://localhost:3000`에서 확인하세요.

### 스크립트

| 명령어 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 시작 |
| `npm run lint` | ESLint 검사 |
| `npm run type-check` | TypeScript 타입 검사 |
| `npm run test` | 테스트 실행 |
| `npm run test:watch` | 테스트 워치 모드 |
| `npm run test:coverage` | 커버리지 포함 테스트 |

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── (main)/              # 메인 페이지 (홈, 스킬 목록/상세/업로드, 마이페이지)
│   ├── admin/               # 관리자 (대시보드, 스킬·유저·신고 관리)
│   ├── api/
│   │   ├── mcp/             # 🤖 MCP 서버 엔드포인트
│   │   ├── skills/          # 스킬 CRUD + npm 배포
│   │   ├── reviews/         # 리뷰
│   │   ├── bookmarks/       # 북마크
│   │   ├── downloads/       # 다운로드 기록
│   │   └── reports/         # 신고
│   └── auth/                # 로그인 / 회원가입
├── components/
│   ├── ui/                  # Button, Input, Modal, Badge, Avatar 등
│   ├── layout/              # Navbar, AdminSidebar, Footer
│   ├── skills/              # SkillCard, SkillGrid, SkillSearch 등
│   └── auth/                # LoginForm, SignupForm
├── hooks/                   # useAuth, useSkills, useBookmarks 등
├── lib/
│   ├── supabase/            # 클라이언트/서버/미들웨어 Supabase 클라이언트
│   └── validations/         # Zod 스키마 (auth, skill)
├── types/                   # TypeScript 타입 정의
└── constants/               # 상수 정의

supabase/
└── migrations/              # SQL 마이그레이션 파일 (6개)
```

---

## 🗄 DB 구조

| 테이블 | 설명 |
|--------|------|
| `profiles` | 사용자 프로필 (username, role, is_blocked) |
| `skills` | 스킬 (title, description, category, tags, file_url, status) |
| `reviews` | 리뷰 (skill_id, rating, content) |
| `likes` | 좋아요 (skill_id, user_id) |
| `bookmarks` | 북마크 (skill_id, user_id) |
| `downloads` | 다운로드 기록 |
| `reports` | 신고 (skill_id, reason) |
| `activity_logs` | 활동 로그 |

- 모든 테이블에 RLS (Row Level Security) 적용
- 좋아요/북마크 카운트 트리거 자동 업데이트
- 회원가입 시 프로필 자동 생성 트리거

---

## 📜 License

MIT

---

<div align="center">

**스킬이 쌓일수록 팀 전체의 생산성이 올라갑니다 💪**

</div>
