# SkillVault

AI 스킬을 찾고, 만들고, 공유하는 마켓플레이스 플랫폼

> Claude 에이전트 스킬을 한 곳에서 검색하고, 내 워크플로우에 바로 적용하세요.

## 주요 기능

- **스킬 마켓플레이스** - 카테고리/검색/정렬 필터링, 페이지네이션
- **스킬 업로드** - 드래그 앤 드롭 파일 업로드, 미리보기 이미지, 태그 관리
- **리뷰 시스템** - 별점 + 코멘트, 자동 평점 갱신
- **즐겨찾기** - 낙관적 업데이트 (Optimistic Update)
- **인증** - 이메일/비밀번호, 이메일 인증, 미들웨어 라우트 보호
- **관리자 대시보드** - 스킬 승인/거절, 유저 관리/차단, 신고 관리
- **마이페이지** - 내 스킬, 즐겨찾기, 내 리뷰
- **보안** - RLS, Zod 검증, 미들웨어 인증/권한 체크

## 기술 스택

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB_&_Storage-3FCF8E?style=flat-square&logo=supabase)

| 분류 | 기술 |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Backend | Supabase (Auth, Database, Storage, RLS) |
| Data Fetching | React Query (TanStack Query) |
| Form | React Hook Form + Zod |
| Animation | Framer Motion |
| Error Monitoring | Sentry |
| Testing | Jest + React Testing Library |
| CI/CD | GitHub Actions |

## 시작하기

### 1. 저장소 클론 및 패키지 설치

```bash
git clone https://github.com/Jeongseokjin/SkillVault.git
cd SkillVault
npm install
```

### 2. 환경 변수 설정

`.env.example`을 `.env.local`로 복사 후 값을 채워주세요.

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (서버 전용) |
| `NEXT_PUBLIC_APP_URL` | 앱 URL (기본: `http://localhost:3000`) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN |
| `SENTRY_AUTH_TOKEN` | Sentry 인증 토큰 |

### 3. Supabase 설정

`supabase/migrations/` 폴더의 SQL 파일을 순서대로 Supabase SQL Editor에서 실행합니다.

1. `001_initial_schema.sql` - 테이블, 트리거, 함수
2. `002_rls_policies.sql` - RLS 정책
3. `003_add_missing_tables.sql` - bookmarks, reports, activity_logs 테이블
4. `004_rls_bookmarks_reports.sql` - 추가 RLS 정책
5. `005_functions.sql` - 평점/다운로드 자동 갱신 함수
6. `006_storage.sql` - 스토리지 버킷 및 정책

### 4. 개발 서버

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 스크립트

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 시작 |
| `npm run lint` | ESLint 검사 |
| `npm run type-check` | TypeScript 타입 검사 |
| `npm run test` | 테스트 실행 |
| `npm run test:watch` | 테스트 워치 모드 |
| `npm run test:coverage` | 커버리지 포함 테스트 |

## 프로젝트 구조

```
src/
  app/
    (auth)/            # 로그인, 회원가입
    (main)/            # 메인 페이지, 스킬 상세/업로드, 마이페이지
    admin/             # 관리자 대시보드, 스킬/유저/신고 관리
    api/               # API 라우트 (skills, reviews, downloads, bookmarks, reports)
  components/
    ui/                # Button, Input, Modal, Badge, Avatar, Pagination 등
    layout/            # Navbar, AdminSidebar, Footer
    skills/            # SkillCard, SkillGrid, SkillSearch, SkillUploadForm 등
    auth/              # LoginForm, SignupForm
  hooks/               # useAuth, useSkills, useSkillDetail, useBookmarks 등
  lib/
    supabase/          # 클라이언트/서버/미들웨어 Supabase 클라이언트
    validations/       # Zod 스키마 (auth, skill)
    utils.ts           # cn 유틸리티
  types/               # TypeScript 타입 정의
  constants/           # 상수 정의
  __tests__/           # Jest 테스트
supabase/
  migrations/          # SQL 마이그레이션 파일 (6개)
.github/
  workflows/           # GitHub Actions CI 워크플로우
```

## License

MIT
