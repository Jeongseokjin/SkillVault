import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useSkills } from '@/hooks/useSkills'
import type { SkillFilterValues } from '@/types'

const mockCalls: Record<string, unknown[][]> = {}

function trackCall(name: string, args: unknown[]) {
  if (!mockCalls[name]) mockCalls[name] = []
  mockCalls[name].push(args)
}

function createChainable(): Record<string, (...args: unknown[]) => unknown> {
  const chain: Record<string, (...args: unknown[]) => unknown> = {}

  const methods = ['select', 'eq', 'or', 'order', 'range']

  for (const method of methods) {
    chain[method] = (...args: unknown[]) => {
      trackCall(method, args)
      if (method === 'range') {
        return { data: [], error: null, count: 0 }
      }
      return chain
    }
  }

  return chain
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => createChainable(),
  }),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const defaultFilters: SkillFilterValues = {
  category: '전체',
  sort: 'latest',
  search: '',
  page: 1,
  limit: 12,
}

describe('useSkills', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockCalls)) {
      delete mockCalls[key]
    }
  })

  it('fetches skills with default filters', async () => {
    const { result } = renderHook(() => useSkills(defaultFilters), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    })
  })

  it('applies category filter when not 전체', async () => {
    const filters: SkillFilterValues = {
      ...defaultFilters,
      category: '개발',
    }

    const { result } = renderHook(() => useSkills(filters), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const eqCalls = mockCalls['eq'] ?? []
    const hasCategoryFilter = eqCalls.some(
      (args) => args[0] === 'category' && args[1] === '개발'
    )
    expect(hasCategoryFilter).toBe(true)
  })

  it('does not apply category filter when 전체', async () => {
    const { result } = renderHook(() => useSkills(defaultFilters), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const eqCalls = mockCalls['eq'] ?? []
    const hasCategoryFilter = eqCalls.some(
      (args) => args[0] === 'category'
    )
    expect(hasCategoryFilter).toBe(false)
  })

  it('applies popular sort order', async () => {
    const filters: SkillFilterValues = {
      ...defaultFilters,
      sort: 'popular',
    }

    const { result } = renderHook(() => useSkills(filters), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const orderCalls = mockCalls['order'] ?? []
    const hasPopularSort = orderCalls.some(
      (args) => args[0] === 'downloads'
    )
    expect(hasPopularSort).toBe(true)
  })

  it('calculates correct pagination range', async () => {
    const filters: SkillFilterValues = {
      ...defaultFilters,
      page: 3,
      limit: 12,
    }

    const { result } = renderHook(() => useSkills(filters), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const rangeCalls = mockCalls['range'] ?? []
    expect(rangeCalls[0]).toEqual([24, 35])
  })
})
