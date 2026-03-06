// ========================
// 유저 관련 타입
// ========================
export type UserRole = 'superadmin' | 'admin' | 'user'

export interface Profile {
  id: string
  email: string
  username: string | null
  avatar_url: string | null
  role: UserRole
  is_blocked: boolean
  created_at: string
  updated_at: string
}

// ========================
// 스킬 관련 타입
// ========================
export type SkillStatus = 'pending' | 'approved' | 'rejected'
export type SkillPrice = 'free' | 'premium'
export type Category = '디자인/UI' | '개발' | '마케팅' | '기타'
export type SortOption = 'latest' | 'popular' | 'rating'

export interface Skill {
  id: string
  title: string
  description: string | null
  category: Category
  tags: string[]
  author_id: string
  author?: Profile
  price: SkillPrice
  downloads: number
  rating: number
  rating_count: number
  status: SkillStatus
  file_url: string | null
  preview_url: string | null
  version: string
  created_at: string
  updated_at: string
}

export interface SkillWithAuthor extends Skill {
  author: Profile
}

// ========================
// 리뷰 관련 타입
// ========================
export interface Review {
  id: string
  skill_id: string
  user_id: string
  user?: Profile
  rating: number
  comment: string | null
  created_at: string
}

// ========================
// 다운로드 관련 타입
// ========================
export interface Download {
  id: string
  skill_id: string
  skill?: Skill
  user_id: string
  created_at: string
}

// ========================
// 즐겨찾기 관련 타입
// ========================
export interface Bookmark {
  id: string
  skill_id: string
  skill?: Skill
  user_id: string
  created_at: string
}

// ========================
// 신고 관련 타입
// ========================
export type ReportStatus = 'pending' | 'resolved' | 'dismissed'

export interface Report {
  id: string
  skill_id: string
  skill?: Skill
  reporter_id: string
  reporter?: Profile
  reason: string
  status: ReportStatus
  created_at: string
}

// ========================
// 활동 로그 관련 타입
// ========================
export interface ActivityLog {
  id: string
  user_id: string
  user?: Profile
  action: string
  target_type: string | null
  target_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// ========================
// API 응답 타입
// ========================
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// ========================
// 폼 타입
// ========================
export interface LoginFormValues {
  email: string
  password: string
}

export interface SignupFormValues {
  email: string
  password: string
  confirmPassword: string
  username: string
}

export interface SkillUploadFormValues {
  title: string
  description: string
  category: Category
  tags: string[]
  price: SkillPrice
  file: File | null
  preview: File | null
}

export interface ReviewFormValues {
  rating: number
  comment: string
}

export interface ReportFormValues {
  reason: string
}

// ========================
// 필터/검색 타입
// ========================
export interface SkillFilterValues {
  category: Category | '전체'
  sort: SortOption
  search: string
  page: number
  limit: number
}

// ========================
// 관리자 통계 타입
// ========================
export interface AdminStats {
  totalSkills: number
  totalUsers: number
  totalDownloads: number
  pendingSkills: number
  pendingReports: number
  todayDownloads: number
  todaySignups: number
}
