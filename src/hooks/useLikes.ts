'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Like } from '@/types'

const QUERY_KEY = ['likes'] as const

async function fetchUserLikes(userId: string): Promise<Like[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error('좋아요 목록을 불러오는데 실패했습니다')
  return (data ?? []) as Like[]
}

async function toggleLike(
  skillId: string,
  userId: string,
  isLiked: boolean
): Promise<{ added: boolean }> {
  const supabase = createClient()

  if (isLiked) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('skill_id', skillId)
      .eq('user_id', userId)

    if (error) throw new Error('좋아요 취소에 실패했습니다')
    return { added: false }
  }

  const { error } = await supabase
    .from('likes')
    .insert({ skill_id: skillId, user_id: userId })

  if (error) throw new Error('좋아요에 실패했습니다')
  return { added: true }
}

export function useLikes(userId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, userId],
    queryFn: () => fetchUserLikes(userId!),
    enabled: Boolean(userId),
  })
}

export function useLikeToggle(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      skillId,
      isLiked,
    }: {
      skillId: string
      isLiked: boolean
    }) => {
      if (!userId) throw new Error('로그인이 필요합니다')
      return toggleLike(skillId, userId, isLiked)
    },
    onMutate: async ({ skillId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: [...QUERY_KEY, userId] })

      const previousLikes = queryClient.getQueryData<Like[]>([
        ...QUERY_KEY,
        userId,
      ])

      queryClient.setQueryData<Like[]>([...QUERY_KEY, userId], (old) => {
        if (!old) return old
        if (isLiked) {
          return old.filter((like) => like.skill_id !== skillId)
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
      })

      return { previousLikes }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData([...QUERY_KEY, userId], context.previousLikes)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, userId] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      queryClient.invalidateQueries({ queryKey: ['skill'] })
    },
  })
}
