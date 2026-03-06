import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SkillSearch from '@/components/skills/SkillSearch'

describe('SkillSearch', () => {
  it('renders input and search button', () => {
    render(<SkillSearch onSearch={jest.fn()} />)
    expect(screen.getByPlaceholderText('스킬 검색...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument()
  })

  it('renders with default value', () => {
    render(<SkillSearch defaultValue="react" onSearch={jest.fn()} />)
    expect(screen.getByDisplayValue('react')).toBeInTheDocument()
  })

  it('calls onSearch on form submit', async () => {
    const handleSearch = jest.fn()
    const user = userEvent.setup()

    render(<SkillSearch onSearch={handleSearch} />)

    const input = screen.getByPlaceholderText('스킬 검색...')
    await user.type(input, '타입스크립트')
    fireEvent.click(screen.getByRole('button', { name: '검색' }))

    expect(handleSearch).toHaveBeenCalledWith('타입스크립트')
  })

  it('calls onSearch on Enter key', async () => {
    const handleSearch = jest.fn()
    const user = userEvent.setup()

    render(<SkillSearch onSearch={handleSearch} />)

    const input = screen.getByPlaceholderText('스킬 검색...')
    await user.type(input, 'nextjs{Enter}')

    expect(handleSearch).toHaveBeenCalledWith('nextjs')
  })

  it('updates input value on change', async () => {
    const user = userEvent.setup()

    render(<SkillSearch onSearch={jest.fn()} />)

    const input = screen.getByPlaceholderText('스킬 검색...')
    await user.type(input, 'test')

    expect(input).toHaveValue('test')
  })
})
