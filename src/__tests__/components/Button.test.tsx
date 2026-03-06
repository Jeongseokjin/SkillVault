import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/ui/Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>클릭</Button>)
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>클릭</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>비활성</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>로딩</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not render children when isLoading', () => {
    render(<Button isLoading>로딩텍스트</Button>)
    expect(screen.queryByText('로딩텍스트')).not.toBeInTheDocument()
  })

  it('applies primary variant styles by default', () => {
    render(<Button>기본</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-accent')
  })

  it('applies danger variant styles', () => {
    render(<Button variant="danger">삭제</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-error')
  })

  it('applies fullWidth class', () => {
    render(<Button fullWidth>넓게</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('w-full')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">작게</Button>)
    expect(screen.getByRole('button').className).toContain('text-[13px]')

    rerender(<Button size="lg">크게</Button>)
    expect(screen.getByRole('button').className).toContain('text-base')
  })
})
