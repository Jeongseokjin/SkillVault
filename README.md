# SkillVault

AI 스킬을 찾고, 만들고, 공유하는 마켓플레이스 플랫폼

> Claude 에이전트 스킬을 한 곳에서 검색하고, 내 워크플로우에 바로 적용하세요.

## 주요 기능

- **스킬 탐색** - 카테고리별 필터, 실시간 검색, 정렬 (최신/인기/평점)
- **스킬 업로드** - 파일 업로드, 태그 관리, 관리자 승인 시스템
- **리뷰 & 평점** - 별점 등록, 리뷰 작성
- **다운로드 관리** - 다운로드 기록, 통계 추적
- **인증 시스템** - 이메일 회원가입/로그인, Supabase Auth
- **관리자 대시보드** - 스킬 승인/거절, 유저 관리, 통계
- **마이페이지** - 내 스킬, 다운로드 기록, 프로필 수정

> 스크린샷 추가 예정

## 기술 스택

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3FCF8E?style=flat-square&logo=supabase)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7-EC5990?style=flat-square&logo=reacthookform)
![Zod](https://img.shields.io/badge/Zod-3-3E67B1?style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?style=flat-square&logo=framer)
![Radix UI](https://img.shields.io/badge/Radix_UI-Primitives-161618?style=flat-square)

## 로컬 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/Jeongseokjin/SkillVault.git
cd SkillVault
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env.example`을 참고하여 `.env.local` 파일을 생성합니다.

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (서버 전용) |
| `NEXT_PUBLIC_APP_URL` | 앱 URL (기본: http://localhost:3000) |

### 4. Supabase 테이블 생성

`supabase/migrations/` 폴더의 SQL 파일을 순서대로 Supabase SQL Editor에서 실행합니다.

1. `001_initial_schema.sql` - 테이블 및 트리거 생성
2. `002_rls_policies.sql` - Row Level Security 정책

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

## 폴더 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── admin/              # 관리자 (대시보드, 스킬/유저 관리)
│   ├── api/                # API 라우트
│   ├── auth/               # 로그인, 회원가입
│   ├── mypage/             # 마이페이지
│   └── skills/             # 스킬 목록, 상세, 업로드
├── components/
│   ├── auth/               # 인증 폼 컴포넌트
│   ├── layout/             # Navbar, Footer
│   ├── skills/             # 스킬 카드, 그리드, 필터
│   └── ui/                 # 공통 UI 컴포넌트
├── hooks/                  # 커스텀 훅 (useAuth, useSkills)
├── lib/
│   ├── supabase/           # Supabase 클라이언트 (client, server, middleware)
│   ├── utils.ts            # 유틸리티 함수
│   └── validations/        # Zod 스키마
├── store/                  # 전역 상태
├── types/                  # TypeScript 타입 정의
└── middleware.ts           # Next.js 미들웨어 (인증, 권한)
```

## 배포

> 배포 주소 추가 예정

## License

MIT
