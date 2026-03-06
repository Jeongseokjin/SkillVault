import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('px-4', 'py-2')
    expect(result).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toBe('base active')
  })

  it('removes falsy values', () => {
    const result = cn('base', false, null, undefined, 'end')
    expect(result).toBe('base end')
  })

  it('merges conflicting tailwind classes', () => {
    const result = cn('px-4', 'px-6')
    expect(result).toBe('px-6')
  })

  it('merges conflicting color classes', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('handles empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles array input', () => {
    const result = cn(['px-4', 'py-2'])
    expect(result).toBe('px-4 py-2')
  })

  it('handles object input', () => {
    const result = cn({ 'px-4': true, 'py-2': false, 'mt-4': true })
    expect(result).toBe('px-4 mt-4')
  })
})
