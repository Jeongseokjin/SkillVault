// ========================
// 페이지네이션
// ========================
export const ITEMS_PER_PAGE = 12
export const ADMIN_ITEMS_PER_PAGE = 20

// ========================
// 파일 업로드
// ========================
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const MAX_PREVIEW_SIZE_MB = 2
export const MAX_PREVIEW_SIZE_BYTES = MAX_PREVIEW_SIZE_MB * 1024 * 1024
export const ALLOWED_FILE_TYPES = ['.md', '.txt', '.json', '.yaml', '.yml']
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ========================
// 유효성 검사
// ========================
export const MIN_PASSWORD_LENGTH = 8
export const MAX_TITLE_LENGTH = 100
export const MAX_DESCRIPTION_LENGTH = 1000
export const MAX_TAGS_COUNT = 5
export const MAX_TAG_LENGTH = 20
export const MAX_COMMENT_LENGTH = 500
export const MIN_USERNAME_LENGTH = 2
export const MAX_USERNAME_LENGTH = 30

// ========================
// Rate Limiting
// ========================
export const RATE_LIMIT_MAX_REQUESTS = 60
export const RATE_LIMIT_WINDOW_MS = 60 * 1000
export const UPLOAD_RATE_LIMIT_MAX = 10
export const UPLOAD_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

// ========================
// 카테고리
// ========================
export const CATEGORIES = [
  { value: '전체', label: '전체' },
  { value: '디자인/UI', label: '디자인/UI' },
  { value: '개발', label: '개발' },
  { value: '마케팅', label: '마케팅' },
  { value: '기타', label: '기타' },
] as const

// ========================
// 정렬 옵션
// ========================
export const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'likes', label: '좋아요순' },
] as const

// ========================
// 스킬 상태
// ========================
export const SKILL_STATUS_LABELS = {
  pending: '승인 대기',
  approved: '승인됨',
  rejected: '거절됨',
} as const

export const SKILL_STATUS_COLORS = {
  pending: '#D97706',
  approved: '#16A34A',
  rejected: '#DC2626',
} as const

// ========================
// 신고 사유
// ========================
export const REPORT_REASONS = [
  '스팸/도배',
  '부적절한 콘텐츠',
  '저작권 침해',
  '허위 정보',
  '기타',
] as const

// ========================
// 라우트
// ========================
export const ROUTES = {
  HOME: '/',
  SKILLS: '/skills',
  SKILL_DETAIL: (id: string) => `/skills/${id}`,
  SKILL_UPLOAD: '/skills/upload',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  MYPAGE: '/mypage',
  ADMIN: '/admin',
  ADMIN_SKILLS: '/admin/skills',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
  BLOCKED: '/blocked',
} as const

// ========================
// 보호 경로 (미들웨어용)
// ========================
export const PROTECTED_ROUTES = ['/mypage', '/skills/upload']
export const ADMIN_ROUTES = ['/admin']
