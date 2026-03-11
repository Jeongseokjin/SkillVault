'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Bookmark } from '@/types'

const QUERY_KEY = ['bookmarks'] as const

async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, skill:skills!bookmarks_skill_id_fkey(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('즐겨찾기를 불러오는데 실패했습니다')
  }

  return (data ?? []) as Bookmark[]
}

async function toggleBookmark(
  skillId: string,
  userId: string,
  isBookmarked: boolean
): Promise<{ added: boolean }> {
  const supabase = createClient()

  if (isBookmarked) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('skill_id', skillId)
      .eq('user_id', userId)

    if (error) throw new Error('즐겨찾기 해제에 실패했습니다')
    return { added: false }
  }

  const { error } = await supabase
    .from('bookmarks')
    .insert({ skill_id: skillId, user_id: userId })

  if (error) throw new Error('즐겨찾기 추가에 실패했습니다')
  return { added: true }
}

export function useBookmarks(userId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, userId],
    queryFn: () => fetchBookmarks(userId!),
    enabled: Boolean(userId),
  })
}

export function useBookmarkToggle(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      skillId,
      isBookmarked,
    }: {
      skillId: string
      isBookmarked: boolean
    }) => {
      if (!userId) throw new Error('로그인이 필요합니다')
      return toggleBookmark(skillId, userId, isBookmarked)
    },
    onMutate: async ({ skillId, isBookmarked }) => {
      await queryClient.cancelQueries({ queryKey: [...QUERY_KEY, userId] })

      const previousBookmarks = queryClient.getQueryData<Bookmark[]>([
        ...QUERY_KEY,
        userId,
      ])

      queryClient.setQueryData<Bookmark[]>(
        [...QUERY_KEY, userId],
        (old) => {
          if (!old) return old
          if (isBookmarked) {
            return old.filter((bookmark) => bookmark.skill_id !== skillId)
          }
          return [
            {
              id: `optimistic-${skillId}`,
              skill_id: skillId,
              user_id: userId!,
              created_at: new Date().toISOString(),
            },
            ...old,
          ]
        }
      )

      return { previousBookmarks }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData(
          [...QUERY_KEY, userId],
          context.previousBookmarks
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, userId] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      queryClient.invalidateQueries({ queryKey: ['skill'] })
    },
  })
}
