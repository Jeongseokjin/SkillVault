'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import type { User } from '@supabase/supabase-js'

interface UseAuthReturn {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id)
          return
        }
        setUser(null)
        setProfile(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUser() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    setUser(currentUser)

    if (currentUser) {
      await fetchProfile(currentUser.id)
    }

    setIsLoading(false)
  }

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) setProfile(data)
  }

  return {
    user,
    profile,
    isLoading,
    isAdmin: profile?.role === 'admin' || profile?.role === 'superadmin',
  }
}
