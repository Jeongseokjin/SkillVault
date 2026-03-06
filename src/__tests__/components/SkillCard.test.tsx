import { render, screen, fireEvent } from '@testing-library/react'
import SkillCard from '@/components/skills/SkillCard'
import type { SkillWithAuthor } from '@/types'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSkill: SkillWithAuthor = {
  id: 'skill-1',
  title: '테스트 스킬',
  description: '테스트 설명입니다',
  category: '개발',
  tags: ['react', 'typescript', 'nextjs', 'tailwind'],
  author_id: 'user-1',
  price: 'free',
  downloads: 1234,
  rating: 4.5,
  rating_count: 10,
  status: 'approved',
  file_url: null,
  preview_url: null,
  version: '1.0.0',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  author: {
    id: 'user-1',
    email: 'test@test.com',
    username: 'tester',
    avatar_url: null,
    role: 'user',
    is_blocked: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
}

describe('SkillCard', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders skill title', () => {
    render(<SkillCard skill={mockSkill} />)
    expect(screen.getByText('테스트 스킬')).toBeInTheDocument()
  })

  it('renders skill description', () => {
    render(<SkillCard skill={mockSkill} />)
    expect(screen.getByText('테스트 설명입니다')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<SkillCard skill={mockSkill} />)
    expect(screen.getByText('개발')).toBeInTheDocument()
  })

  it('renders free badge for free skills', () => {
    render(<SkillCard skill={mockSkill} />)
    expect(screen.getByText('무료')).toBeInTheDocument()
  })

  it('renders premium badge for premium skills', () => {
    const premiumSkill = { ...mockSkill, price: 'premium' as const }
    render(<SkillCard skill={premiumSkill} />)
    expect(screen.getByText('프리미엄')).toBeInTheDocument()
  })

  it('renders rating', () => {
    render(<SkillCard skill={mockSkill} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('renders download count', () => {
    render(<SkillCard skill={mockSkill} />)
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('shows max 3 tags and overflow count', () => {
    render(<SkillCard skill={mockSkill} />)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
    expect(screen.getByText('nextjs')).toBeInTheDocument()
    expect(screen.queryByText('tailwind')).not.toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('navigates to detail page on click', () => {
    render(<SkillCard skill={mockSkill} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockPush).toHaveBeenCalledWith('/skills/skill-1')
  })

  it('navigates on Enter key', () => {
    render(<SkillCard skill={mockSkill} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(mockPush).toHaveBeenCalledWith('/skills/skill-1')
  })

  it('calls onBookmarkToggle when bookmark clicked', () => {
    const handleToggle = jest.fn()
    render(
      <SkillCard
        skill={mockSkill}
        onBookmarkToggle={handleToggle}
      />
    )
    const bookmarkButton = screen.getByLabelText('즐겨찾기')
    fireEvent.click(bookmarkButton)
    expect(handleToggle).toHaveBeenCalledWith('skill-1')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows status badge when showStatus is true', () => {
    render(<SkillCard skill={mockSkill} showStatus />)
    expect(screen.getByText('승인됨')).toBeInTheDocument()
  })
})
